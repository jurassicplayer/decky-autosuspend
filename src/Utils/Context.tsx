import { createContext, FC, useContext, useMemo, useState } from 'react'
import { ServerAPI } from "decky-frontend-lib"
import { BackendCtx } from "./Backend"
import { BatteryState, Hour, SettingsProps, SteamSettings } from "./Interfaces"
import { SettingsManager } from "./Settings"
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
      version: 'v2.0.1',
      processAlarms: false
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
      this.appInfo.processAlarms = true
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
  public timeformat24!: boolean
  public vecHours!: Hour[]
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
    this.activeHooks.push(SteamClient.Settings.RegisterForSettingsChanges((value: SteamSettings) => {this.onSettings(value)}))
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
  private onSettings(value: SteamSettings) {
    let { vecValidAutoUpdateRestrictHours } = value
    this.vecHours = vecValidAutoUpdateRestrictHours
    let { strDisplay } = vecValidAutoUpdateRestrictHours[0]
    if (strDisplay == "0:00") {
      this.timeformat24 = true
    } else if (strDisplay == "12AM") {
      this.timeformat24 = false
    } else {
      Logger.warning("Unable to determine if time format is 12-hour or 24-hour format.")
    }
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
  const setSettings = (context: Context) => {
    // SettingsManager.saveToFile(SettingsManager.validateSettings(context.settings))
    SettingsManager.saveToFile(context.settings)
    setAppCtx(context)
  }
  const settingsContext: SettingsContext = {
    getSettings: ()=>{ return appCtx.settings },
    getSetting: (key) => { return appCtx.settings[key] },
    setSetting: (key, value) => {
      let newCtx = {...appCtx}
      newCtx.settings[key] = value
      setSettings(newCtx)
    },
    getAlarmSettings: (alarmID) => { return appCtx.settings.alarms[alarmID] },
    setAlarmSettings: (alarmID, alarmSettings) => {
      let newCtx = {...appCtx}
      newCtx.settings.alarms[alarmID] = alarmSettings
      setSettings(newCtx)
    },
    getAlarmSetting: (alarmID, key) => { return appCtx.settings.alarms[alarmID][key] },
    setAlarmSetting: (alarmID, key, value) => {
      let newCtx = {...appCtx}
      newCtx.settings.alarms[alarmID][key] = value
      setSettings(newCtx)
    },
    deleteAlarmSetting: (alarmID, key) => {
      let newCtx = {...appCtx}
      delete newCtx.settings.alarms[alarmID][key]
      setSettings(newCtx)
    },
    addAlarm: (alarmID, alarmSettings) => {
      let newCtx = {...appCtx}
      newCtx.settings.alarms[alarmID] = alarmSettings
      setSettings(newCtx)
      Logger.info(`Created alarm [${alarmID}]:\n${JSON.stringify(alarmSettings, null, 2)}`)
    },
    deleteAlarm: (alarmID) => {
      let newCtx = {...appCtx}
      delete newCtx.settings.alarms[alarmID]
      setSettings(newCtx)
      Logger.info(`Deleted alarm [${alarmID}]`)
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


