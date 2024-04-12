import { /*createContext, useContext,*/ VFC, useEffect } from "react"
import { IAppContext, IAppContextState, IAppInfo } from "./AppContext.h"
import { IHook, HookType } from "./Hooks"
import { IHour } from "../SteamUtils/SteamClient.interfaces"
import { Backend } from "./BackendContext"

var defaultAppSettings: IAppSettings = {
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

export class AppContext implements IAppContext {
  appInfo: IAppInfo
  applicationInitialized = false
  pauseAlarmProcessingForConsoleOff = false
  caffeineMode = false
  eventBus = new EventTarget()
  activeHooks: IHook[] = []
  activeRoutes: string[] = []
  timeformat24 = false
  vecHours: IHour[] = []
  settings: IAppSettings = defaultAppSettings
  registerRoute = (path: string, component: VFC, exact = false) => {
    let Component = component
    let ctxWrapper = <AppContextProvider appContext={this}><Component /></AppContextProvider>
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
  registerHook = (hookType: HookType) => false
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
  constructor() {
    this.appInfo = new AppInfo("AutoSuspend","0.0.1","v0.0.1",1)
  }
  getAppInfo = async (configVersion: number) => {
    let pluginInfo = await Backend.getPluginInfo()
    let { pluginName, pluginVersion, deckyVersion } = pluginInfo
    return new AppInfo(pluginName, pluginVersion, deckyVersion, configVersion)
  }

  onDismount = () => {
    this.unregisterRoutes()
    this.unregisterHooks()
  }
  unregisterRoutes = () => { this.activeRoutes.forEach(route => { this.unregisterRoute(route) }) }
  unregisterHooks = () => { this.activeHooks.forEach(hook => { this.unregisterHook(hook.hooktype) }) }
}
//#endregion


import { FC, createContext, useContext, useMemo, useState } from "react"
import { IAppSettings } from "./SettingsContext.h"

const AppCtx = createContext<IAppContextState>(null as any)
export const useAppContext = () => useContext(AppCtx)

export const AppContextProvider: FC<{appContext: IAppContext}> = ({appContext, children}) =>  {
  const [appContextState, setAppContextState] = useState<IAppContext>(appContext)
  const setAppContext = (data: any) => { setAppContextState({...appContextState, ...data}) }

  useEffect(() => {
    Backend.getSetting("configVersion", "none").then((configVersion) => {
      if (!isNaN(Number(configVersion))) {
        if (Number(configVersion) < defaultAppSettings.configVersion) {
          console.log(`Older config version found: need to migrate to v${defaultAppSettings.configVersion}`)
        }
      } else {
        console.log(`No config OR config version below v3`)
      }
      appContextState.getAppInfo(defaultAppSettings.configVersion).then((appInfo: IAppInfo) => {
        setAppContext({appInfo: appInfo})
        console.log(`Created App Context`)
      })
    })
  }, [])

  const context = {context: appContextState, setContext: setAppContext}
  return (
    <AppCtx.Provider value={context}>
      {useMemo(() => children, [])}
    </AppCtx.Provider>
  )
}