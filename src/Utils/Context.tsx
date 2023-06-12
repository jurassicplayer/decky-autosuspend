import { createContext, FC, useContext } from 'react'
import { ServerAPI } from "decky-frontend-lib"
import { BackendCtx } from "./Backend"
import { BatteryState } from "../lib/SteamClient"
import { SettingsProps, SettingsManager } from "./Settings"
import { events } from "./Events"
import { Logger } from "./Logger"

interface AppInfo {
  initialized: boolean
  name: string
  version: string
}

// #region Context definition and constructor
interface Context {
  settings: SettingsProps       // When modifying settings, apply modification to this and use for plugin.
  userSettings: SettingsProps   // When modifying settings, apply modification to this and save. Preserves any non-functional alarms for later fixing.
  appInfo: AppInfo
  batteryState: BatteryState
  eventBus: EventTarget
}
export class AppContextState implements Context {
  constructor(serverAPI: ServerAPI) {
    this.appInfo = {
      initialized: false,
      name: 'AutoSuspend',
      version: 'v2.0.0'
    }
    BackendCtx.initialize(serverAPI)
    Logger.info('Initializing frontend')
    this.intervalID = setInterval(()=>{
      // @ts-ignore
      let currentState = window.SystemPowerStore.batteryState
      if (currentState != this.batteryState) this.updateBatteryState(currentState)
    }, 1000)
    this.initialize()
  }
  public settings!: SettingsProps
  public userSettings!: SettingsProps
  public appInfo!: AppInfo
  public batteryState!: BatteryState
  public eventBus: EventTarget = new EventTarget()
  private intervalID!: NodeJS.Timer

  private async initialize() {
    let {validSettings, userSettings} = await SettingsManager.loadFromFile()
    this.settings = validSettings
    this.userSettings = userSettings
    this.appInfo.initialized = true
    //await SettingsManager.saveToFile(this.settings)
    Logger.info('Initialization complete')
  }
  public onDismount() {
    clearInterval(this.intervalID)
  }
  updateBatteryState(batteryState: BatteryState) {
    this.batteryState = batteryState
    this.eventBus.dispatchEvent(new events.BatteryStateEvent(this.batteryState))
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


