import { IObjectKeys } from "../Plugin/Common.h"
import { HookType } from "../Plugin/Hooks"
import { ReactElement, VFC } from "react"

export enum AlarmType {
  overcharge = 'overcharge',
  discharge = 'discharge',
  //dailyPlaytime = 'dailyPlaytime',
  //sessionPlaytime = 'sessionPlaytime',
  //bedtime = 'bedtime',
  //inactivity = 'inactivity',
  //downloadComplete = 'downloadComplete'
}

export enum triggerAction {
  none = "None",
  bashHook = "Bash Hook",
  screenOff = "Screen Off",
  suspend = "Suspend",
  powerOff = "Power Off"
}

export interface ITriggerAction extends IObjectKeys {
  id: string
  name: string
  action: triggerAction
  args: string[] | null
}

export interface IAlarmSettings extends IObjectKeys {
  showToast: boolean
  playSound: boolean
  sound: string
  repeatToast: boolean
  repeatSound: boolean
  repeatAlarm: number
  id: string
  toastTitle: string
  toastMessage: string
  thresholdLevel: number
  thresholdType: string
  triggerActions: triggerAction[]
  sortOrder: number
  enabled: boolean
}

export interface IMetadata extends IObjectKeys {
  name: string
  type: string
  icon: ReactElement
  defaults: IAlarmSettings
  hooks: HookType[]
  alarm: any
}

export interface IHistory extends IObjectKeys {
  triggered: boolean
  lastTriggered: number
}

export interface IAlarm extends IObjectKeys {
  settings: IAlarmSettings
  history: IHistory
  canEval: () => boolean
  evaluate: () => boolean
  settingsComponent: VFC<{alarmSettings: IAlarmSettings}>
}

export interface IAlarmConstructor {
  new (alarmSettings?: IAlarmSettings): IAlarm
}