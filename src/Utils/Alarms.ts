import { SteamUtils } from "./SteamUtils"
import { AppContextState } from "./Context"
import { events } from "./Events"
import { SettingsManager, SettingsProps } from "./Settings"
import { sleep } from "decky-frontend-lib"
import { IObjectKeys } from "./Interfaces"

// #region Enumerations
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
// #endregion

// #region Constants
const minute = 1000 * 60
const hour = minute * 60
const day = hour * 24
// #endregion

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

export function applyDefaults(settings: AlarmSetting, defaults: SettingsProps) {
  let { showToast, playSound, sound, repeatToast, repeatSound, alarmRepeat, alarmMessage } = settings
  let { defaultShowToast, defaultPlaySound, defaultSound, defaultRepeatToast, defaultRepeatSound, defaultAlarmRepeat } = defaults
  let showToastOrDefault    = (typeof showToast     != 'undefined') ? showToast    : defaultShowToast
  let playSoundOrDefault    = (typeof playSound     != 'undefined') ? playSound    : defaultPlaySound
  let soundOrDefault        = (typeof sound         != 'undefined') ? sound        : defaultSound
  let repeatToastOrDefault  = (typeof repeatToast   != 'undefined') ? repeatToast  : defaultRepeatToast
  let repeatSoundOrDefault  = (typeof repeatSound   != 'undefined') ? repeatSound  : defaultRepeatSound
  let alarmRepeatOrDefault  = (typeof alarmRepeat   != 'undefined') ? alarmRepeat  : defaultAlarmRepeat
  let alarmMessageOrBlank   = (typeof alarmMessage  != 'undefined') ? alarmMessage : ""
  let newSettings = {
    showToast:    showToastOrDefault,
    playSound:    playSoundOrDefault,
    sound:        soundOrDefault,
    repeatToast:  repeatToastOrDefault,
    repeatSound:  repeatSoundOrDefault,
    alarmRepeat:  alarmRepeatOrDefault,
    alarmMessage: alarmMessageOrBlank
  }
  return {...settings, ...newSettings}
}

export const evaluateAlarm = async (alarmID: string, settings: AlarmSetting, context: AppContextState) => {
  let { showToast, playSound, sound, repeatToast, repeatSound, alarmRepeat, alarmName, alarmMessage, thresholdLevel, thresholdType, triggeredAction, enabled, profile } = applyDefaults(settings, context.settings)
  if (!enabled) { return }
  // @ts-ignore
  if (profile && profile != loginStore.m_strAccountName) { return }
  let history = getAlarmHistory(alarmID) || { triggered: false }
  showToast = showToast
  let triggerAction = false
  let date = new Date()
  // Evaluate triggers
  switch (thresholdType) {
    case thresholdTypes.discharge:
      (function () {
        if (!context.batteryState.bHasBattery) { // Disable discharge alarms when no battery present
          context.settings.alarms[alarmID].enabled = false
          SettingsManager.saveToFile(context.settings)
          return
        }
        let offset = 0.5 // Fix rounding (visually changes at 0.5%)
        let batteryPercent = Math.round(context.batteryState.flLevel * 10000) / 100
        if (batteryPercent <= thresholdLevel+offset && !history.triggered) { // Trigger discharge
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (batteryPercent > thresholdLevel+offset && history.triggered) { // Reset discharge trigger
          history.triggered = false
        }  
      }())
      break
    case thresholdTypes.overcharge:
      (function () {
        if (!context.batteryState.bHasBattery) { // Disable overcharge alarms when no battery present
          context.settings.alarms[alarmID].enabled = false
          SettingsManager.saveToFile(context.settings)
          return
        }
        let offset = 0.5 // Fix rounding (visually changes at 0.5%)
        let batteryPercent = Math.round(context.batteryState.flLevel * 10000) / 100
        if (batteryPercent >= thresholdLevel+offset && !history.triggered) { // Trigger overcharge
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (batteryPercent < thresholdLevel+offset && history.triggered) { // Reset overcharge trigger
          history.triggered = false
        }
      }())
      break
    case thresholdTypes.bedtime:
      (function () {
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
      }())
      break
    case thresholdTypes.dailyPlaytime:
      (function () {
        history.currentPlayTime = history.currentPlayTime || 0
        history.sessionStartTime = history.sessionStartTime || date.getTime()
        history.lastTriggered = history.lastTriggered || 0
        let currentDate = (Math.floor(date.getTime() / day) * day) + (date.getTimezoneOffset() * minute)
        let lastTriggeredDate = (Math.floor((history.lastTriggered || 0) / day) * day) + (date.getTimezoneOffset() * minute)
        let currentPlaytime = date.getTime() - (history.sessionStartTime || date.getTime())
        // console.log(`dailyPlaytime evaluate:\n
        //   \tcurrentDate ${currentDate}\n
        //   \tlastTriggeredDate ${lastTriggeredDate}\n
        //   \tcurrentPlaytime ${currentPlaytime}\n
        //   \tthreshold ${thresholdLevel}\n
        //   \ttriggered ${history.triggered}\n
        //   \thistory `, history)
        if (currentPlaytime >= thresholdLevel && !history.triggered) {
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if ((currentPlaytime < thresholdLevel || currentDate > lastTriggeredDate) && history.triggered) {
          delete history.currentPlayTime
          history.triggered = false
        }
      }())
      break
    case thresholdTypes.sessionPlaytime:
      (function () {
        let currentPlaytime = date.getTime() - (history.sessionStartTime || date.getTime())
        if (currentPlaytime >= thresholdLevel && !history.triggered) {
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (currentPlaytime < thresholdLevel && history.triggered) {
          history.triggered = false
        }
      }())
      break
  }
  setAlarmHistory(alarmID, history)
  if (!triggerAction) { return }
  // Send notifications
  alarmMessage = alarmMessage ? alarmMessage : ''
  SteamUtils.notify(alarmName, alarmMessage, showToast, playSound, sound, 5000) // First toast
  if (alarmRepeat) {
    let sleepDuration = 3000
    for (let i = 0; i < alarmRepeat; i++) {
      if (repeatToast) { showToast = true }
      else { showToast = false }
      if (repeatSound) {
        playSound = true
        if (!repeatToast) { sleepDuration = 500 }
      } else { playSound = false }
      await sleep(sleepDuration)
      await SteamUtils.notify(alarmName, alarmMessage, showToast, playSound, sound)
    }
  }
  
  switch (triggeredAction) {
    case triggerActions.suspend:
      sleep(5500)
      //SteamUtils.suspend()
      console.log(`[${alarmName}]: action triggered, suspending`)
      break
    case triggerActions.shutdown:
      sleep(5500)
      //SteamUtils.suspend()
      console.log(`[${alarmName}]: action triggered, shutting down`)
      break
    default:
  }
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
    //console.log(`OnSuspend alarm processing [${alarmID}]:\n\tcurrentPlayTime: ${history.currentPlayTime}\n\tlastTriggeredDate ${history.sessionStartTime}\n\tnew currentPlayTime ${(history.currentPlayTime || 0) + (date - (history.sessionStartTime || date))}\n\thistory `, history)
    history.currentPlayTime = (history.currentPlayTime || 0) + (date - (history.sessionStartTime || date))
    delete history.sessionStartTime
    setAlarmHistory(alarmID, history)
  }
}
const OnResume = (context: AppContextState) => {
  let alarms = context.settings.alarms
  for (let alarmID in alarms) {
    let {thresholdType} = alarms[alarmID]
    switch (thresholdType) {
      case thresholdTypes.dailyPlaytime:
        (function () {
          let history = getAlarmHistory(alarmID) || { triggered: false }
          let date = new Date()
          history.sessionStartTime = date.getTime()
          let currentDate = (Math.floor(date.getTime() / day) * day) + (date.getTimezoneOffset() * minute)
          let lastTriggeredDate = (Math.floor((history.lastTriggered || 0) / day) * day) + (date.getTimezoneOffset() * minute)
          //console.log(`OnResume alarm processing [${alarmID}]:\n\tcurrentDate: ${currentDate}\n\tlastTriggeredDate ${lastTriggeredDate}\n\tnew session start time ${history.sessionStartTime}\n\thistory `, history)
          if (currentDate > lastTriggeredDate && history.triggered) {
            delete history.currentPlayTime
            history.triggered = false
          }
          setAlarmHistory(alarmID, history)
        }())
      case thresholdTypes.sessionPlaytime:
        (function () {
          let history = getAlarmHistory(alarmID) || { triggered: false }
          let date = new Date()
          history.sessionStartTime = date.getTime()
          delete history.currentPlayTime
          history.triggered = false
          setAlarmHistory(alarmID, history)
        }())
      default:
    }
  }
}