import { IObjectKeys } from "./Common.h"
import { IAlarmSetting } from "../Alarms/Alarms.h"
import { IContext, IContextState } from "./Context.h"

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
  name: string
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
  alarms: IAlarmSetting[]
  profiles: IProfile[]
  exclusions: IInExclusionRule[]
  inclusions: IInExclusionRule[]
}

export interface ISettingsContext extends IContext {
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

export interface ISettingsContextState extends IContextState {
  context: ISettingsContext
  setContext: (context:any) => void
}