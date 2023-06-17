import { SteamUtils } from "./SteamUtils"
import { AppContextState } from "./Context"
import { events } from "./Events"

// #region Enumerations
export enum alarmTypes {
  none = 'none',
  repeatToast = 'repeatToast',
  repeatSound = 'repeatSound',
  repeatBoth = 'repeatBoth'
}
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

// #region Interfaces
export interface AlarmSetting {
  showToast?: boolean
  playSound?: boolean
  sound?: string
  alarmType?: alarmTypes
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
// #endregion

// #region Constants
const minute = 1000 * 60
const hour = minute * 60
const day = hour * 24
// #endregion

export const evaluateAlarm = async (alarmID: string, settings: AlarmSetting, context: AppContextState) => {
  let { showToast, playSound, sound, alarmType, alarmRepeat, alarmName, alarmMessage, thresholdLevel, thresholdType, triggeredAction, enabled, profile } = settings
  if (!enabled) { return }
  // @ts-ignore
  if (profile && profile != loginStore.m_strAccountName) { return }
  let history = getAlarmHistory(alarmID) || { triggered: false }
  let triggerAction = false
  let batteryPercent: number
  let date = new Date()
  // Evaluate triggers
  switch (thresholdType) {
    case thresholdTypes.discharge:
      // ##FIXME## Need to fix rounding (visually changes at 0.5%)
      batteryPercent = Math.round(context.batteryState.flLevel * 10000) / 100
      if (batteryPercent <= thresholdLevel && !history.triggered) { // Trigger discharge
        history.lastTriggered = date.getTime()
        history.triggered = true
        triggerAction = true
      } else if (batteryPercent > thresholdLevel && history.triggered) { // Reset discharge trigger
        history.triggered = false
      }
      break
    case thresholdTypes.overcharge:
      batteryPercent = Math.round(context.batteryState.flLevel * 10000) / 100
      if (batteryPercent >= thresholdLevel && !history.triggered) { // Trigger overcharge
        history.lastTriggered = date.getTime()
        history.triggered = true
        triggerAction = true
      } else if (batteryPercent < thresholdLevel && history.triggered) { // Reset overcharge trigger
        history.triggered = false
      }
      break
    case thresholdTypes.bedtime:
      let currentDateUTC = Math.floor(date.getTime() / day) * day
      let currentDate = currentDateUTC + (date.getTimezoneOffset() * minute)
      // thresholdLevel = time delta in ms from 12:00am
      if (date.getTime() >= (currentDate + thresholdLevel) && !history.triggered) { // Trigger bedtime
        history.lastTriggered = date.getTime()
        history.triggered = true
        triggerAction = true
      } else if (date.getTime() < (currentDate + thresholdLevel) && history.triggered) { // Reset overcharge trigger
        history.triggered = false
      }
      break
    case thresholdTypes.dailyPlaytime:
      history.currentPlayTime = history.currentPlayTime || 0
      history.sessionStartTime = history.sessionStartTime || date.getTime()
      history.lastTriggered = history.lastTriggered || 0
      let sessionStartTimeDate = history.sessionStartTime // Perform timezone conversions and truncate to days
      let lastTriggeredDate = history.lastTriggered // Perform timezone conversions and truncate to days
      if (history.currentPlayTime >= thresholdLevel && !history.triggered) {
        history.lastTriggered = date.getTime()
        history.triggered = true
        triggerAction = true
      } else if ((history.currentPlayTime < thresholdLevel || sessionStartTimeDate > lastTriggeredDate) && history.triggered) {
        delete history.currentPlayTime
        history.triggered = false
      }
      break
  }
  setAlarmHistory(alarmID, history)
  if (!triggerAction) { return }
  // Send notifications
  alarmMessage = alarmMessage ? alarmMessage : ''
  SteamUtils.notify(alarmName, alarmMessage, showToast, playSound, sound, 5000) // First toast
  if (alarmRepeat) {
    let sleepDuration = 3000
    switch (alarmType) {
      case alarmTypes.repeatSound:
        showToast = false
        sleepDuration = 500
        break
      case alarmTypes.repeatToast:
        playSound = false
        break
      default:
    }
    for (let i = 0; i < alarmRepeat; i++) {
      await sleep(sleepDuration)
      await SteamUtils.notify(alarmName, alarmMessage, showToast, playSound, sound)
    }
  }
  
  switch (triggeredAction) {
    case triggerActions.suspend:
      // suspend
      if (!context.batteryState.bHasBattery) { return }
      sleep(5500)
      //SteamUtils.suspend()
      console.log(`[${alarmName}]: action triggered, suspending`)
      break
    default:
  }
}

function sleep(ms: number) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  )
}

export function getAlarmHistory(alarmID: string): AlarmHistory | null {
  let s_histories = localStorage.getItem('autosuspend-alarms')
  let histories: {[key: string]: AlarmHistory} = JSON.parse(s_histories ? s_histories : '{}')
  let history = null
  if (alarmID in histories) { history = histories[alarmID] }
  return history
}
export function setAlarmHistory(alarmID: string, history: AlarmHistory) {
  let s_histories = localStorage.getItem('autosuspend-alarms')
  let histories = JSON.parse(s_histories ? s_histories : '{}')
  histories[alarmID] = history
  localStorage.setItem('autosuspend-alarms', JSON.stringify(histories))
}

export function registerAlarmEvents(context: AppContextState) {
  context.eventBus.addEventListener(events.SuspendEvent.eType, () => OnSuspend(context))
  context.eventBus.addEventListener(events.ShutdownEvent.eType, () => OnSuspend(context))
  context.eventBus.addEventListener(events.ResumeEvent.eType, () => OnResume(context))
}
export function unregisterAlarmEvents(context: AppContextState) {
  context.eventBus.removeEventListener(events.SuspendEvent.eType, () => OnSuspend(context))
  context.eventBus.removeEventListener(events.ShutdownEvent.eType, () => OnSuspend(context))
  context.eventBus.removeEventListener(events.ResumeEvent.eType, () => OnResume(context))
}
const OnSuspend = (context: AppContextState) => {
  let alarms = context.settings.alarms
  for (let alarmID in alarms) {
    let {thresholdType} = alarms[alarmID]
    if (thresholdType != thresholdTypes.dailyPlaytime) { continue }
    let history = getAlarmHistory(alarmID) || { triggered: false }
    let date = Date.now()
    history.currentPlayTime = (history.currentPlayTime || 0) + (date - (history.sessionStartTime || date))
    delete history.sessionStartTime
    console.log(history.currentPlayTime)
    setAlarmHistory(alarmID, history)
  }
}
const OnResume = (context: AppContextState) => {
  let alarms = context.settings.alarms
  for (let alarmID in alarms) {
    let {thresholdType} = alarms[alarmID]
    if (thresholdType != thresholdTypes.dailyPlaytime) { continue }
    let history = getAlarmHistory(alarmID) || { triggered: false }
    let date = new Date()
    history.sessionStartTime = date.getTime()
    let currentDate = (Math.floor(date.getTime() / day) * day) + (date.getTimezoneOffset() * minute)
    let lastTriggeredDate = (Math.floor((history.lastTriggered || 0) / day) * day) + (date.getTimezoneOffset() * minute)
    console.log(currentDate, lastTriggeredDate)
    if (currentDate > lastTriggeredDate && history.triggered) {
      delete history.currentPlayTime
      history.triggered = false
    }
    setAlarmHistory(alarmID, history)
  }
}