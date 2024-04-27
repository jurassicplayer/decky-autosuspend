import { VFC } from "react"
import { IObjectKeys } from "./Common.h"
import { IHook, HookType } from "./Hooks"
import { IHour } from "../SteamUtils/SteamClient.interfaces"
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
}
export interface IAppContextState extends IAppContext {
  registerRoute: (path: string, component: VFC, exact: boolean) => void
  unregisterRoute: (path: string) => void
  registerHook: (hookType: HookType) => IHook
  unregisterHook: (hookType: HookType) => boolean
  unregisterRoutes: () => void
  unregisterHooks: () => void
  setContext: (context: Partial<IAppContext>) => void
  _createPseudoBatteryStateChangeRegistry: () => ()=>void
}

//#endregion

