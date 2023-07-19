import { ReorderableEntry, ServerAPI } from "decky-frontend-lib"
import { AppContextState } from "./Context"

interface IObjectKeys {
  [key: string]: any
}
// #region SteamClient
export interface BatteryState {
  bHasBattery: boolean,
  bShutdownRequested: boolean,
  eACState: number,
  flLevel: number,
  nSecondsRemaining: number,
}
export interface SteamSettings extends IObjectKeys {
  bCefRemoteDebuggingEnabled: boolean
  bChangeBetaEnabled: boolean
  bCheckScreenshotsEnabled: boolean
  bCloudEnabled: boolean
  bCompatEnabled: boolean
  bCompatEnabledForOtherTitles: boolean
  bDisplayIsExternal: boolean
  bDisplayIsUsingAutoScale: boolean
  bEnableGamepadUIOverlay: boolean
  bEnableSoftProcessKill: boolean
  bEnableTabbedAppDetails: boolean
  bEnableTestUpdaters: boolean
  bForceOOBE: boolean
  bIsInClientBeta: boolean
  bIsInDesktopUIBeta: boolean
  bIsOfflineMode: boolean
  bIsSteamSideload: boolean
  bIsValveEmail: boolean
  bLibraryWhatsNewShowOnlyProductUpdates: boolean
  bOOBETestModeEnabled: boolean
  bShowMobxDevTools: boolean
  bShowStoreContentOnHome: boolean
  bSmallMode: boolean
  bUISoundsEnabled: boolean
  bUnderscanEnabled: boolean
  eClientBetaState: number //enumeration?
  eOverrideBrowserComposerMode: number //enumeration?
  flAutoDisplayScaleFactor: number
  flCurrentDisplayScaleFactor: number
  flCurrentUnderscanLevel: number
  flMaxDisplayScaleFactor: number
  flMinDisplayScaleFactor: number
  nAvailableBetas: number
  nSelectedBetaID: number
  strCompatTool: string
  strDisplayName: string
  strSelectedBetaName: string
  vecAvailableClientBetas: AvailableClientBeta[]
  vecNightModeScheduledHours: Hour[]
  vecValidAutoUpdateRestrictHours: Hour[]
  vecValidDownloadRegions: DownloadRegion[]
}
interface AvailableClientBeta {
  nBetaID: number
  strName: string
}
export interface Hour {
  nHour: number
  strDisplay: string
}
interface DownloadRegion {
  nRegionID: number
  strRegionName: string
}
// #endregion
export interface AppInfo {
  initialized: boolean
  name: string
  version: string
  processAlarms: boolean
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
  timeformat24: boolean
  vecHours: Hour[]
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
export interface AlarmHistory extends AlarmHistoryBase, AlarmHistoryDailySession, AlarmHistoryPlaySession {}
export interface AlarmHistoryBase {
  triggered: boolean
  lastTriggered: number
}
export interface AlarmHistoryDailySession extends AlarmHistoryBase {
  lastUpdatedTime?: number
  currentPlayTime?: number
}
export interface AlarmHistoryPlaySession extends AlarmHistoryBase {
  sessionStartTime?: number
}
export type AlarmItemProps<T> = {
  entry: ReorderableEntry<T>
  setAlarms: CallableFunction
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
export interface thresholdLevels extends IObjectKeys {
  discharge: number
  overcharge: number
  bedtime: number
  dailyPlaytime: number
  sessionPlaytime: number
}
// #endregion
