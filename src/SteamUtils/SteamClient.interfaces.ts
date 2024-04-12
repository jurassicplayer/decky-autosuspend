import { Module, findModuleChild } from "decky-frontend-lib"
import { IObjectKeys } from "../Plugin/Common.h"

//#region BatteryStateEvent
export interface IBatteryState extends IObjectKeys {
  bHasBattery: boolean,
  bShutdownRequested: boolean,
  eACState: number,
  flLevel: number,
  nSecondsRemaining: number,
}
//#endregion

//#region SettingsChangeEvent
export interface ISteamSettings extends IObjectKeys {
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
  vecAvailableClientBetas: IAvailableClientBeta[]
  vecNightModeScheduledHours: IHour[]
  vecValidAutoUpdateRestrictHours: IHour[]
  vecValidDownloadRegions: IDownloadRegion[]
}
interface IAvailableClientBeta {
  nBetaID: number
  strName: string
}
export interface IHour {
  nHour: number
  strDisplay: string
}
interface IDownloadRegion {
  nRegionID: number
  strRegionName: string
}
//#endregion

//#region GameActionEvent
export interface IBaseGameAction extends IObjectKeys {
  gameActionIdentifier: number
}
export interface IGameAction extends IBaseGameAction {
  appId: number
  action: string
  param3: number
}
//#endregion

//#region DownloadItemsEvent
export interface IDownloadItems extends IObjectKeys {
  isDownloading: boolean
  downloadItems: ITransferItem[]
}
export interface ITransferItem {
  active: boolean
  appid: number
  buildid: number
  completed: boolean
  completed_time: number
  deferred_time: number
  downloaded_bytes: number
  launch_on_completion: boolean
  paused: boolean
  queue_index: number
  target_buildid: number
  total_bytes: number
  update_error: string
  update_result: number
  update_type_info: IUpdateTypeInfo[]
}
export interface IUpdateTypeInfo {
  has_update: boolean
  completed_update: boolean
  total_bytes: number
  downloaded_bytes: number
}
//#endregion

//#region ControllerInputEvent
enum buttonAction {
  Up = 20,
  Left = 22,
  Right = 23,
  Down = 21,
  lStickClick = 25,
  lBumper = 30,
  lTrigger = 28,
  recents = 35,
  hamburgerMenu = 36,
  rStickClick = 41,
  Ybutton = 3,
  Abutton = 0,
  Bbutton = 1,
  Xbutton = 2,
  rBumper = 31,
  rTrigger = 29
}
export interface IControllerInputMessage {
  nA: buttonAction
  bS: boolean
  nC: number
}
//#endregion

export interface IDownloadOverview extends IObjectKeys {
  lan_peer_hostname: string
  paused: boolean
  throttling_suspended: boolean
  update_appid: number
  update_bytes_downloaded: number
  update_bytes_processed: number
  update_bytes_staged: number
  update_bytes_to_download: number
  update_bytes_to_process: number
  update_bytes_to_stage: number
  update_disc_bytes_per_second: number
  update_is_install: boolean
  update_is_prefetch_estimate: boolean
  update_is_shader: boolean
  update_is_upload: boolean
  update_is_workshop: boolean
  update_network_bytes_per_second: number
  update_peak_network_bytes_per_second: number
  update_seconds_remaining: number
  update_start_time: number
  update_state: string
}

const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m) {
      try {
        if (m[prop][property]) {
          return m[prop];
        }
      } catch (e) {
        return undefined;
      }
    }
  });
}
export const NavSoundMap = findModule("ToastMisc")