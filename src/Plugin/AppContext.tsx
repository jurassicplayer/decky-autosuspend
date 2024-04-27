import { VFC } from "react"
import { IAppContext, IAppContextState, IAppInfo } from "./AppContext.h"
import { HookType, toHook } from "./Hooks"
import { Backend } from "./Backend"

//#region Class Declarations
class AppInfo implements IAppInfo {
  pluginName: string
  pluginVersion: string
  deckyVersion: string
  configVersion: number
  majorVersion: number
  minorVersion: number
  bugfixVersion: number
  constructor(pluginName: string, pluginVersion: string, deckyVersion: string, configVersion: number) {
    this.pluginName = pluginName
    this.pluginVersion = pluginVersion
    this.deckyVersion = deckyVersion
    this.configVersion = configVersion
    // Split semantic version
    let [majorVersion, minorVersion, bugfixVersion] = this.pluginVersion.split('.').map((n) => Number(n))
    this.majorVersion = majorVersion
    this.minorVersion = minorVersion
    this.bugfixVersion = bugfixVersion
  }
}

export var DefaultSettings: IAppSettings = {
  configVersion: 3,
  debuggingMode: false,
  defaults: {
    showToast: true,
    playSound: true,
    sound: "ToastMisc",
    repeatToast: false,
    repeatSound: false,
    repeatAlarm: -1
  },
  alarms: [],
  profiles: [],
  exclusions: [],
  inclusions: []
}

export var AutoSuspend: IAppContext = {
  appInfo: {
    configVersion: 0,
    majorVersion: 0,
    minorVersion: 0,
    bugfixVersion: 0,
    pluginName: "",
    pluginVersion: "",
    deckyVersion: ""
  },
  applicationInitialized: false,
  pauseAlarmProcessingForConsoleOff: false,
  caffeineMode: false,
  eventBus: new EventTarget(),
  activeHooks: [],
  activeRoutes: [],
  timeformat24: false,
  vecHours: [],
  settings: DefaultSettings
}


export class AppContextState implements IAppContextState {
  appInfo = AutoSuspend.appInfo
  applicationInitialized = AutoSuspend.applicationInitialized
  pauseAlarmProcessingForConsoleOff = AutoSuspend.pauseAlarmProcessingForConsoleOff
  caffeineMode = AutoSuspend.caffeineMode
  eventBus = AutoSuspend.eventBus
  activeHooks = AutoSuspend.activeHooks
  activeRoutes = AutoSuspend.activeRoutes
  timeformat24 = AutoSuspend.timeformat24
  vecHours = AutoSuspend.vecHours
  settings = AutoSuspend.settings
  registerRoute = (path: string, component: VFC, exact = false) => {
    let Component = component
    let ctxWrapper = <AppContextProvider><Component /></AppContextProvider>
    if (exact) {
      Backend.serverAPI.routerHook.addRoute(path, () => ctxWrapper, {exact: true})
    } else {
      Backend.serverAPI.routerHook.addRoute(path, () => ctxWrapper)
    }
    this.activeRoutes.push(path)
  }
  unregisterRoute = (path: string) => {
    Backend.serverAPI.routerHook.removeRoute(path)
    this.activeRoutes = this.activeRoutes.filter(route => route !== path)
  }
  registerHook = (hookType: HookType) => {
    let hook = toHook(hookType)
    switch (hookType) {
      case HookType.RegisterForBatteryStateChangesPseudo:
      // Pass context
        hook.unregister = this._createPseudoBatteryStateChangeRegistry()
        break
      case HookType.RegisterForTimeStateChangePseudo:
        // Pass context
        hook.unregister = this._createPseudoBatteryStateChangeRegistry()
        break
      case HookType.RegisterForSettingsChanges:
        //hook.unregister = SteamClient[hook.subsystem][hook.register]((evt: Event)=> { context.eventBus.dispatchEvent(new SettingsChangeEvent(events.map.SettingsChange, { detail: evt })) })
        break
    }
    return hook
  }
  unregisterHook = (hookType: HookType) => {
    //Logger.info(`Unregistering hook: ${hookName}`)
    let hook = this.activeHooks.find(hook => hook.hooktype == hookType)
    if (!hook) { return false }
    console.log('Unregistering hook', hookType, hook, hook.unregister, this.activeHooks)
    if (hook.unregister !== null) hook.unregister()
    this.activeHooks = this.activeHooks.filter(hook => hook.hooktype !== hookType)
    //Logger.info(`Unregistered hook: ${hookType}`)
    return true
  }
  onDismount = () => {
    this.unregisterRoutes()
    this.unregisterHooks()
  }
  unregisterRoutes = () => { this.activeRoutes.forEach(route => { this.unregisterRoute(route) }) }
  unregisterHooks = () => { this.activeHooks.forEach(hook => { this.unregisterHook(hook.hooktype) }) }
  setContext = () => {}
  _createPseudoBatteryStateChangeRegistry = () => {
    let intervalID = setInterval(() => {
      // @ts-ignore
      let currentState = window.SystemPowerStore.batteryState
      this.eventBus.dispatchEvent(new BatteryStateChangeEvent(events.map.BatteryStateChange, { detail: currentState }))
    }, 1000)
    return () => clearInterval(intervalID)
  }
}


export const updatePersistentValues = (newContext: Partial<IAppContext>) => {
  AutoSuspend = {...AutoSuspend, ...newContext}
  console.log(`Update persistent values: `, AutoSuspend)
}
export const initializeApp = async (serverAPI: ServerAPI) => {
  Backend.initialize(serverAPI)

  // Get configuration information
  let configVersion = await Backend.getSetting("configVersion", "none")
  let settings = Settings.loadSettings()
  // Get application information
  let { pluginName, pluginVersion, deckyVersion } = await Backend.getPluginInfo()
  let appInfo = new AppInfo(pluginName, pluginVersion, deckyVersion, configVersion as number)
  // Get device settings
  // timeformat / vecHours

  updatePersistentValues({applicationInitialized: true, settings: settings, appInfo: appInfo})
}
//#endregion


import { FC, createContext, useContext, useMemo, useState } from "react"
import { Settings } from "./SettingsContext"
import { ServerAPI } from "decky-frontend-lib"
import { BatteryStateChangeEvent } from "../Alarms/Battery/Battery.interfaces"
import { events } from "./BackendContext.h"
import { IAppSettings } from "./SettingsContext.h"

const AppCtx = createContext<IAppContextState>(null as any)
export const useAppContext = (): IAppContextState => {
  const context = useContext(AppCtx)
  if (!context) { throw new Error('useAppContext must be used within an AppContextProvider') }
  return context
}

export const AppContextProvider: FC = ({children}) =>  {
  const [state, setState] = useState<IAppContextState>(new AppContextState())
  const updateState = (context: Partial<IAppContext>, commitSettings = false) => {
    let newState = {...state, ...context}
    setState(newState)
    // if (!commitSettings) {
    //   newState = {...newState, settings: AutoSuspend.settings}
    // }
    if (commitSettings) Settings.saveSettings(newState.settings)
    updatePersistentValues(newState)
    // When wanting to read settings for acting on alarm, use Settings.getAlarmSettings(alarmID)
    // When reading settings to initialize configuration pages, use context settings
    // When configuring values from alarm configuration page, utilize context settings
    // Only save the settings when hitting the save button OR when directly applying changes
    // ex. changing inclusions/exclusions
    // This way, the configuration page always loads with the current live settings, but
    // will still be reactive in the event that any of the settings changes
  }

  const contextHandle = {...state, setContext: updateState}
  const value = useMemo(()=>contextHandle, [contextHandle])
  return (
    <AppCtx.Provider value={value}>
      {useMemo(() => children, [])}
    </AppCtx.Provider>
  )
}