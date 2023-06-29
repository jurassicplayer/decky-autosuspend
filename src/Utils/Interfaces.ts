import { ReorderableEntry, ServerAPI } from "decky-frontend-lib"
import { AppContextState } from "./Context"

interface IObjectKeys {
  [key: string]: any
}

export interface BatteryState {
  bHasBattery: boolean,
  bShutdownRequested: boolean,
  eACState: number,
  flLevel: number,
  nSecondsRemaining: number,
}
export interface AppInfo {
  initialized: boolean
  name: string
  version: string
}
export interface SteamHook {
  unregister: () => void
}

// #region Context
export interface Context {
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
export interface SettingsContext {
  getSettings: () => SettingsProps
  getSetting: (key: string) => any
  setSetting: (key: string, value: any) => void
  getAlarmSettings: (alarmID: string) => AlarmSetting
  setAlarmSettings: (alarmID: string, alarmSettings: AlarmSetting) => void
  getAlarmSetting: (alarmID: string, key: string) => any
  setAlarmSetting: (alarmID: string, key: string, value: any) => void
  deleteAlarmSetting: (alarmID: string, key: string) => void
  addAlarm: (alarmID: string, alarmSettings: AlarmSetting) => void
  deleteAlarm: (alarmID: string) => void
}
export interface ProviderProps { appContextState: AppContextState }
// #endregion

// #region Settings Interfaces
export interface SettingsProps extends IObjectKeys {
  defaultShowToast: boolean
  defaultPlaySound: boolean
  defaultSound: string
  defaultRepeatToast: boolean
  defaultRepeatSound: boolean
  defaultAlarmRepeat: number
  debuggingMode: boolean
  alarms: Alarms
}
// #endregion

// #region Alarm Setting Enumerations
export enum thresholdTypes {
  overcharge = 'overcharge',
  discharge = 'discharge',
  dailyPlaytime = 'dailyPlaytime',
  sessionPlaytime = 'sessionPlaytime',
  bedtime = 'bedtime'
}
export enum triggerActions {
  none = 'none',
  suspend = 'suspend',
  shutdown = 'shutdown'
}
// #endregion

// #region Alarm Settting Interfaces
export interface AlarmSetting extends IObjectKeys {
  showToast?: boolean
  playSound?: boolean
  sound?: string
  repeatToast?: boolean
  repeatSound?: boolean
  alarmRepeat?: number
  alarmName: string
  alarmMessage?: string
  thresholdLevel: number
  thresholdType: thresholdTypes
  triggeredAction: triggerActions
  enabled: boolean
  profile?: string
  sortOrder: number
}
export interface Alarms {
  [uniqueid: string]: AlarmSetting
}
export interface AlarmHistory {
  triggered: boolean
  lastTriggered?: number
  sessionStartTime?: number
  currentPlayTime?: number
}
export type AlarmItemProps<T> = {
  entry: ReorderableEntry<T>
}
export interface EntryProps {
  alarmID: string
  alarmName: string
}
export interface AlarmItemSettingsProps {
  alarmID: string
  loginUsers: LoginUser[]
}
export interface ProfileData {
  personaName: string
  avatarUrl: string
}
export interface LoginUser extends ProfileData {
  accountName: string
  rememberPassword: boolean
}
// #endregion
