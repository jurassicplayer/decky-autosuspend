import { VFC } from "react"
import { IObjectKeys } from "./Common.h"
import { IHook, HookType } from "./Hooks"
import { IHour } from "../SteamUtils/SteamClient.interfaces"
import { IContextState } from "./Context.h"
import { IAppSettings } from "./SettingsContext.h"

//#region Interface Declarations
export interface IPluginInfo extends IObjectKeys {
  pluginName: string
  pluginVersion: string
  deckyVersion: string
}
export interface IAppInfo extends IPluginInfo {
  configVersion: number
  majorVersion: number
  minorVersion: number
  bugfixVersion: number
}
export interface IAppContext extends IObjectKeys {
  appInfo: IAppInfo
  applicationInitialized: boolean
  pauseAlarmProcessingForConsoleOff: boolean // previously named `processAlarms`
  caffeineMode: boolean
  eventBus: EventTarget
  activeHooks: IHook[]
  activeRoutes: string[]
  timeformat24: boolean
  vecHours: IHour[]
  settings: IAppSettings
  registerRoute: (path: string, component: VFC, exact: boolean) => void
  unregisterRoute: (path: string) => void
  registerHook: (hookType: HookType) => boolean
  unregisterHook: (hookType: HookType) => boolean
  getAppInfo: (configVersion: number) => Promise<IAppInfo>
  onDismount: () => void
  unregisterRoutes: () => void
  unregisterHooks: () => void
}
export interface IAppContextState extends IContextState {
  context: IAppContext
  setContext: (context:any) => void
}

//#endregion

