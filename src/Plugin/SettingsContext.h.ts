import { IObjectKeys } from "./Common.h"
import { IAlarmSettings } from "../Alarms/Alarms.h"

// enum NavSoundMap {
//   LaunchGame,
//   FriendMessage,
//   ChatMention,
//   ChatMessage,
//   ToastMessage,
//   ToastAchievement,
//   ToastMisc,
//   FriendOnline,
//   FriendInGame,
//   VolSound,
//   ShowModal,
//   HideModal,
//   IntoGameDetail,
//   OutOfGameDetail,
//   PagedNavigation,
//   ToggleOn,
//   ToggleOff,
//   SliderUp,
//   SliderDown,
//   ChangeTabs,
//   DefaultOk,
//   OpenSideMenu,
//   CloseSideMenu,
//   BasicNav,
//   FailedNav,
//   Typing
// }



export interface IInExclusionRule extends IObjectKeys {
  id: string
  name: string
  appIDs: number[]
  alarmIDs: string[]
}

export interface IProfile extends IObjectKeys {
  username: string
  alarmIDs: string[]
}

export interface IDefaultSettings extends IObjectKeys {
  showToast: boolean
  playSound: boolean
  sound: string
  repeatToast: boolean
  repeatSound: boolean
  repeatAlarm: number
}

export interface IAppSettings extends IObjectKeys {
  configVersion: number
  debuggingMode: boolean
  defaults: IDefaultSettings
  alarms: IAlarmSettings[]
  profiles: IProfile[]
  exclusions: IInExclusionRule[]
  inclusions: IInExclusionRule[]
}

export interface ISettingsContext {
  getSettings: () => any
  getSetting: (key: string) => any
  setSetting: (key: string, value: any) => void
  getAlarmSettings: (alarmID: string) => any
  setAlarmSettings: (alarmID: string, alarmSettings: any) => void
  getAlarmSetting: (alarmID: string, key: string) => any
  setAlarmSetting: (alarmID: string, key: string, value: any) => void
  deleteAlarmSetting: (alarmID: string, key: string) => void
  addAlarm: (alarmID: string, alarmSettings: any) => void
  deleteAlarm: (alarmID: string) => void
}
