import { createContext, FC, useContext, useMemo, useState } from 'react'
import { ServerAPI } from "decky-frontend-lib"
import { BackendCtx } from "./Backend"
import { BatteryState } from "./Interfaces"
import { SettingsProps, SettingsManager } from "./Settings"
import { events } from "./Events"
import { Logger } from "./Logger"
import { registerAlarmEvents, unregisterAlarmEvents } from './Alarms'
import { AlarmList } from '../Browser/AlarmList'
import { AppInfo, Context, ProviderProps, SettingsContext, SteamHook } from './Interfaces'



export class AppContextState implements Context {
  constructor(serverAPI: ServerAPI) {
    this.serverApi = serverAPI
    this.appInfo = {
      initialized: false,
      name: 'AutoSuspend',
      version: 'v2.0.0'
    }
    BackendCtx.initialize(serverAPI)
    Logger.info('Initializing frontend')
    SettingsManager.loadFromFile().then((settings)=>{
      this.settings = settings
      this.intervalID = setInterval(()=>{
        // @ts-ignore
        let currentState = window.SystemPowerStore.batteryState
        if (currentState != this.batteryState) this.updateBatteryState(currentState)
      }, 1000)
      this.registerHooks()
      this.registerRoutes()
      registerAlarmEvents(this)
      this.onResume() // Trigger OnResume alarm events on "boot" to setup alarms
      this.appInfo.initialized = true
      Logger.info('Initialization complete')
    })
  }
  public serverApi: ServerAPI
  public settings!: SettingsProps
  public appInfo: AppInfo
  public batteryState!: BatteryState
  public eventBus: EventTarget = new EventTarget()
  public activeHooks: SteamHook[] = []
  public activeRoutes: string[] = []
  private intervalID!: NodeJS.Timer

  public onDismount() {
    clearInterval(this.intervalID)
    unregisterAlarmEvents(this)
    this.unregisterRoutes()
    this.unregisterHooks()
  }
  public registerRoute = (path: string, component: React.ComponentType) => {
    let Component = component
    let ctxWrapper = <AppContextProvider appContextState={this}><Component /></AppContextProvider>
    this.serverApi.routerHook.addRoute(path, () => ctxWrapper)
    this.activeRoutes.push(path)
  }
  public unregisterRoute = (path: string) => {
    this.serverApi.routerHook.removeRoute(path)
    this.activeRoutes = this.activeRoutes.filter(route => route !== path)
  }
  private registerRoutes() {
    this.registerRoute("/autosuspend/alarms", AlarmList)
  }
  private unregisterRoutes() {
    this.activeRoutes.forEach((route) => { this.unregisterRoute(route) })
  }
  private registerHooks() {
    this.activeHooks.push(SteamClient.System.RegisterForOnSuspendRequest(() => {this.onSuspend()}))
    this.activeHooks.push(SteamClient.System.RegisterForOnResumeFromSuspend(() => {this.onResume()}))
    this.activeHooks.push(SteamClient.User.RegisterForShutdownDone(() => {this.onShutdown()}))
  }
  private unregisterHooks() {
    this.activeHooks.forEach((hook) => { hook.unregister() })
  }
  private updateBatteryState(batteryState: BatteryState) {
    this.batteryState = batteryState
    this.eventBus.dispatchEvent(new events.BatteryStateEvent(this.batteryState))
  }
  private onSuspend() {
    this.eventBus.dispatchEvent(new events.SuspendEvent())
  }
  private onResume() {
    this.eventBus.dispatchEvent(new events.ResumeEvent())
  }
  private onShutdown() {
    this.eventBus.dispatchEvent(new events.ShutdownEvent())
  }
}
// #endregion

// Create context and export useAppContext to remove need to import useContext + AppContext
const AppContext = createContext<Context>(null as any)
const SettingsContext = createContext<SettingsContext>(null as any)
export const useAppContext = () => useContext(AppContext)
export const useSettingsContext = () => useContext(SettingsContext)

export const AppContextProvider: FC<ProviderProps> = ({children, appContextState}) => {
  const [appCtx, setAppCtx] = useState<Context>(appContextState)
  const settingsContext: SettingsContext = {
    getSettings: ()=>{ return appCtx.settings },
    getSetting: (key) => { return appCtx.settings[key] },
    setSetting: (key, value) => {
      let newCtx = {...appCtx}
      newCtx.settings[key] = value
      setAppCtx(newCtx)
    },
    getAlarmSettings: (alarmID) => { return appCtx.settings.alarms[alarmID] },
    setAlarmSettings: (alarmID, alarmSettings) => {
      let newCtx = {...appCtx}
      newCtx.settings.alarms[alarmID] = alarmSettings
      setAppCtx(newCtx)
    },
    getAlarmSetting: (alarmID, key) => { 
      console.log(`Get setting ${alarmID}.${key}: `, appCtx.settings.alarms[alarmID][key])
      return appCtx.settings.alarms[alarmID][key] },
    setAlarmSetting: (alarmID, key, value) => {
      console.log(`Set setting ${alarmID}.${key}: `, value)
      let newCtx = {...appCtx}
      newCtx.settings.alarms[alarmID][key] = value
      setAppCtx(newCtx)
    },
    deleteAlarmSetting: (alarmID, key) => {
      console.log(`Delete setting ${alarmID}.${key}`)
      let newCtx = {...appCtx}
      delete newCtx.settings.alarms[alarmID][key]
      setAppCtx(newCtx)
    },
    addAlarm: (alarmID, alarmSettings) => {
      let newCtx = {...appCtx}
      newCtx.settings.alarms[alarmID] = alarmSettings
      setAppCtx(newCtx)
    },
    deleteAlarm: (alarmID) => {
      let newCtx = {...appCtx}
      delete newCtx.settings.alarms[alarmID]
      setAppCtx(newCtx)
    }
  }
  let context = useMemo(()=>appCtx, [appCtx])
  return (
    <AppContext.Provider value={context}>
      <SettingsContext.Provider value={settingsContext}>
        {useMemo(() => children, [])}
      </SettingsContext.Provider>
    </AppContext.Provider>
  )
}


