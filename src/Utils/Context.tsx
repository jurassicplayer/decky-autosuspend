import { createContext, FC, useContext, useMemo, useState } from 'react'
import { ServerAPI } from "decky-frontend-lib"
import { BackendCtx } from "./Backend"
import { BatteryState, Hour, SettingsProps, SteamSettings, DownloadItems, SteamHooks, thresholdTypes, triggerActions } from "./Interfaces"
import { SettingsManager } from "./Settings"
import { events } from "./Events"
import { Logger } from "./Logger"
import { registerAlarmEvents, registerAlarmHooks, unregisterAlarmEvents } from './Alarms'
import { AppInfo, Context, ProviderProps, SettingsContext, SteamHook } from './Interfaces'
import { IAlarm, IAlarmSetting, eAlarmType, eTriggerActions, Alarms } from './Alarm'

export class AppContextState implements Context {
  constructor(serverAPI: ServerAPI) {
    this.serverApi = serverAPI
    this.appInfo = {
      initialized: false,
      processAlarms: false
    }
    BackendCtx.initialize(serverAPI)
    Logger.info('Initializing frontend')
    SettingsManager.loadFromFile().then((settings)=>{
      this.settings = settings
      this.alarms = []
      for (let alarmID in this.settings.alarms) {
        let alarm: IAlarmSetting = {
          ...this.settings.alarms[alarmID],
          thresholdType: eAlarmType[this.settings.alarms[alarmID].thresholdType as keyof typeof eAlarmType],
          triggeredAction: eTriggerActions[this.settings.alarms[alarmID].triggeredAction as keyof typeof eTriggerActions]
        }
        this.alarms.push(Alarms.create(undefined, alarm, alarmID))
      }
      //this.alarms.push(Alarms.create(eAlarmType.discharge))
      //this.alarms.push(Alarms.create(eAlarmType.downloadComplete))
      // console.log(this.alarms)
      // console.log(this.alarms.filter(alarm => alarm.type == eAlarmType.bedtime))
      this.intervalID = setInterval(()=>{
        // @ts-ignore
        let currentState = window.SystemPowerStore.batteryState
        if (currentState != this.batteryState) this.updateBatteryState(currentState)
      }, 1000)
      this.registerHook(SteamHooks.RegisterForSettingsChanges)
      registerAlarmHooks(this)
      // this.registerHooks()
      // this.registerRoutes()
      registerAlarmEvents(this)
      this.onResume() // Trigger OnResume alarm events on "boot" to setup alarms
      BackendCtx.getPluginInfo().then((pluginInfo)=>{
        this.appInfo = {
          ...this.appInfo,
          ...pluginInfo,
          initialized: true,
          processAlarms: true
        }
      })
      Logger.info('Initialization complete')
    })
  }
  public serverApi: ServerAPI
  public settings!: SettingsProps
  public alarms!: IAlarm[]
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
  public registerRoute = (path: string, component: React.ComponentType, exact?: boolean) => {
    let Component = component
    let ctxWrapper = <AppContextProvider appContextState={this}><Component /></AppContextProvider>
    if (exact) {
      this.serverApi.routerHook.addRoute(path, () => ctxWrapper, {exact: true})
    } else {
      this.serverApi.routerHook.addRoute(path, () => ctxWrapper)
    }
    this.activeRoutes.push(path)
  }
  public unregisterRoute = (path: string) => {
    this.serverApi.routerHook.removeRoute(path)
    this.activeRoutes = this.activeRoutes.filter(route => route !== path)
  }
  // private registerRoutes() {
  //   this.registerRoute("/autosuspend/alarms", AlarmList)
  // }
  private unregisterRoutes() {
    this.activeRoutes.forEach(route => { this.unregisterRoute(route) })
  }
  // private registerHooks() {
  //   // Only for hooks that should always be registered  
  // }
  public getActiveAlarmTypes() {
    let alarms = Object.entries(this.settings.alarms).map(([, setting]) => setting.thresholdType)
    let alarmTypes = [...new Set(alarms)]
    return alarmTypes
  }
  public registerHook(hookName: SteamHooks) {
    Logger.debug(`Attempting to register hook: ${hookName}\tFilterCheck: ${this.activeHooks.filter(hook => hook.name == hookName).length == 0}`)
    let callback: CallableFunction | undefined
    if (this.activeHooks.filter(hook => hook.name == SteamHooks.RegisterForSettingsChanges).length == 0) {
      callback = SteamClient.Settings.RegisterForSettingsChanges((value: SteamSettings) => this.onSettings(value))
    } else
    if (this.activeHooks.filter(hook => hook.name == SteamHooks.RegisterForOnSuspendRequest).length == 0) {
      callback = SteamClient.System.RegisterForOnSuspendRequest(() => this.onSuspend())
    } else
    if (this.activeHooks.filter(hook => hook.name == SteamHooks.RegisterForOnResumeFromSuspend).length == 0) {
      callback = SteamClient.System.RegisterForOnResumeFromSuspend(() => this.onResume())
    } else
    if (this.activeHooks.filter(hook => hook.name == SteamHooks.RegisterForShutdownDone).length == 0) {
      callback = SteamClient.User.RegisterForShutdownDone(() => this.onShutdown())
    } else
    if (this.activeHooks.filter(hook => hook.name == SteamHooks.RegisterForDownloadItems).length == 0) {
      callback = SteamClient.Downloads.RegisterForDownloadItems((value: DownloadItems)=> this.onDownloadItems(value))
    } else
    if (this.activeHooks.filter(hook => hook.name == SteamHooks.RegisterForControllerInputMessages).length == 0) {
      callback = SteamClient.Input.RegisterForControllerInputMessages(() => this.onControllerInput())
    }
    if (typeof callback != 'undefined') {
      this.activeHooks.push({name: hookName, unregister: callback})
      Logger.info(`Registered hook: ${hookName}`)
    }
  }
  public unregisterHook(hookName: SteamHooks) {
    let hook = this.activeHooks.find(hook => hook.name == hookName)
    if (!hook) { return }
    hook.unregister()
    this.activeHooks = this.activeHooks.filter(hook => hook.name !== hookName)
    Logger.info(`Unregistered hook: ${hookName}`)
  }
  private unregisterHooks() {
    this.activeHooks.forEach(hook => { hook.unregister() })
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
    this.eventBus.dispatchEvent(new events.SettingsChangeEvent(value))
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
  private onDownloadItems(value: DownloadItems) {
    this.eventBus.dispatchEvent(new events.DownloadItemsEvent(value))
  }
  private onControllerInput() {
    this.eventBus.dispatchEvent(new events.ControllerInputEvent())
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


