import { createContext, FC, useContext } from 'react'
import { ServerAPI } from "decky-frontend-lib"
import { BackendCtx } from "./Backend"
import { BatteryState } from "../lib/SteamClient"
import { SettingsProps, SettingsManager } from "./Settings"
import { events } from "./Events"
import { Logger } from "./Logger"
import { registerAlarmEvents, unregisterAlarmEvents } from './Alarms'
import { AlarmList } from '../Browser/AlarmList'
import { AlarmSettings } from '../Browser/AlarmSettings'

interface AppInfo {
  initialized: boolean
  name: string
  version: string
}
interface SteamHook {
  unregister: () => void
}

// #region Context definition and constructor
interface Context {
  settings: SettingsProps       // When modifying settings, apply modification to this and use for plugin.
  appInfo: AppInfo
  batteryState: BatteryState
  eventBus: EventTarget
  serverApi: ServerAPI
  activeHooks: SteamHook[]
  activeRoutes: string[]
  registerRoute: (path: string, component: React.ComponentType) => void
  unregisterRoute: (path: string) => void
}
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
  private registerRoutes() {
    this.registerRoute("/autosuspend/alarms", AlarmList)
    this.registerRoute("/autosuspend/alarm/:alarmID", AlarmSettings)
  }
  public registerRoute = (path: string, component: React.ComponentType) => {
    this.serverApi.routerHook.addRoute(path, component)
    this.activeRoutes.push(path)
  }
  public unregisterRoute = (path: string) => {
    this.serverApi.routerHook.removeRoute(path)
    this.activeRoutes = this.activeRoutes.filter(route => route !== path)
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
export const useAppContext = () => useContext(AppContext)

interface ProviderProps { appContextState: AppContextState }
export const AppContextProvider: FC<ProviderProps> = ({children, appContextState}) => {
  return (
    <AppContext.Provider value={{...appContextState}}>
      {children}
    </AppContext.Provider>
  )
}


