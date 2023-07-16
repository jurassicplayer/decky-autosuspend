import { SteamUtils } from "./SteamUtils"
import { AppContextState } from "./Context"
import { events } from "./Events"
import { SettingsManager, applyDefaults } from "./Settings"
import { sleep } from "decky-frontend-lib"
import { AlarmHistory, AlarmSetting, BatteryState, thresholdTypes, triggerActions } from "./Interfaces"

function getAlarmHistories(): {[key: string]: AlarmHistory} {
  let s_histories = localStorage.getItem('autosuspend-alarms')
  return JSON.parse(s_histories ? s_histories : '{}')
}
export function getAlarmHistory(alarmID: string): AlarmHistory {
  let histories = getAlarmHistories()
  return (alarmID in histories) ? histories[alarmID] : { triggered: false, lastTriggered: 0 }
}
export function setAlarmHistory(alarmID: string, history?: AlarmHistory) {
  let histories = getAlarmHistories()
  if (history === undefined) { delete histories[alarmID] }
  else if (history) { histories[alarmID] = history }
  localStorage.setItem('autosuspend-alarms', JSON.stringify(histories))
}

const batteryOffset = 0.5 // Fix rounding (visually changes at 0.5%)

function applyDateSubstitutions(format: string, date: Date): string {
  // Apply same type of substitutions that python would
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  let formattedDate = format
    .replaceAll('%a', weekday[date.getDay()].substring(0,3))
    .replaceAll('%A', weekday[date.getDay()])
    .replaceAll('%w', date.getDay().toString())
    .replaceAll('%d', date.getDate().toString().padStart(2,'0'))
    .replaceAll('%-d', date.getDate().toString())
    .replaceAll('%b', month[date.getMonth()].substring(0,3))
    .replaceAll('%B', month[date.getMonth()])
    .replaceAll('%m', date.getMonth().toString().padStart(2,'0'))
    .replaceAll('%-m', date.getMonth().toString())
    .replaceAll('%y', date.getFullYear().toString().substring(2,4))
    .replaceAll('%-y', (date.getFullYear() % 100).toString())
    .replaceAll('%Y', date.getFullYear().toString())
    .replaceAll('%H', date.getHours().toString().padStart(2,'0'))
    .replaceAll('%-H', date.getHours().toString())
    .replaceAll('%I', (date.getHours() % 12 || 12).toString().padStart(2,'0'))
    .replaceAll('%-I', (date.getHours() % 12 || 12).toString())
    .replaceAll('%p', date.toLocaleTimeString().split(' ')[1])
    .replaceAll('%M', date.getMinutes().toString().padStart(2,'0'))
    .replaceAll('%-M', date.getMinutes().toString())
    .replaceAll('%S', date.getSeconds().toString().padStart(2,'0'))
    .replaceAll('%-S', date.getSeconds().toString())
    // .replaceAll('%f', 'microseconds as zero-padded decimal number 000000 - 999999')
    // .replaceAll('%z', 'UTC offset in the form +HHMM or -HHMM')
    .replaceAll('%Z', Intl.DateTimeFormat().resolvedOptions().timeZone)
    // .replaceAll('%j', 'day of the year as a zero-padded decimal number')
    // .replaceAll('%-j', 'day of the year as a decimal number')
    // .replaceAll('%U', 'week of the year, sunday as first day of week, all days in a new year preceding the first Sunday are considered to be in week 0')
    // .replaceAll('%W', 'week of the year, monday as first day of week, all days in a new year preceding the first Monday are considered to be in week 0')
    .replaceAll('%c', date.toLocaleString())
    .replaceAll('%x', date.toLocaleDateString())
    .replaceAll('%X', date.toLocaleTimeString())
    .replaceAll('%%', '%')
  return formattedDate
}

export function applyMessageSubstitutions(message: string, batteryState: BatteryState, alarmID: string): string {
  const second = 1000
  const minute = second * 60
  const hour = minute * 60
  // const day = hour * 24
  let batteryPercent = Math.round(batteryState.flLevel * 10000) / 100
  let { currentPlayTime } = getAlarmHistory(alarmID)
  currentPlayTime = currentPlayTime || 0
  let hours = Math.trunc(currentPlayTime / hour)
  let minutes = Math.trunc((currentPlayTime % hour) / minute)
  let seconds = Math.trunc((currentPlayTime % hour % minute) / second)
  // Substitute general variables
  let result = message
    .replaceAll('{batteryPercent}', `${batteryPercent-batteryOffset}`)
    .replaceAll('{playHours}',`${hours}`)
    .replaceAll('{playMinutes}',`${minutes}`)
    .replaceAll('{playSeconds}',`${seconds}`)
  // Substitute date
  let match
  let date = new Date()
  const regex = /{date:(.*?)}/g
  while ( (match = regex.exec(message)) !== null ) {
    let formattedDate = applyDateSubstitutions(match[1], date)
    result = result.replaceAll(match[0], formattedDate)
  }
  return result
}

export const evaluateAlarm = async (alarmID: string, settings: AlarmSetting, context: AppContextState) => {
  let { showToast, playSound, sound, repeatToast, repeatSound, alarmRepeat, alarmName, alarmMessage, thresholdLevel, thresholdType, triggeredAction, enabled, profile } = applyDefaults(settings, context.settings)
  if (!enabled) { return }
  // @ts-ignore
  if (profile && profile != loginStore.m_strAccountName) { return }
  let history = getAlarmHistory(alarmID)
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
        let batteryPercent = Math.round(context.batteryState.flLevel * 10000) / 100
        if (batteryPercent <= thresholdLevel+batteryOffset && !history.triggered) { // Trigger discharge
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (batteryPercent > thresholdLevel+batteryOffset && history.triggered) { // Reset discharge trigger
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
        let batteryPercent = Math.round(context.batteryState.flLevel * 10000) / 100
        if (batteryPercent >= thresholdLevel+batteryOffset && !history.triggered) { // Trigger overcharge
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (batteryPercent < thresholdLevel+batteryOffset && history.triggered) { // Reset overcharge trigger
          history.triggered = false
        }
      }())
      break
    case thresholdTypes.bedtime:
      (function () {
        let currentDateHourZero = new Date(date.toLocaleDateString())
        let currentDate = currentDateHourZero.getTime() + thresholdLevel
        // thresholdLevel = time delta in ms from 12:00am
        if (date.getTime() >= currentDate && !history.triggered) { // Trigger bedtime
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (date.getTime() < currentDate && history.triggered) { // Reset overcharge trigger
          history.triggered = false
        }
      }())
      break
    case thresholdTypes.dailyPlaytime:
      (function () {
        history.lastTriggered = history.lastTriggered || 0
        history.currentPlayTime = history.currentPlayTime || 0
        history.currentPlayTime = (date.getTime() - (history.lastUpdatedTime || date.getTime())) + history.currentPlayTime // current_playtime + past_playtime
        history.lastUpdatedTime = date.getTime()
        let currentDateHourZero = new Date(date.toLocaleDateString())
        if (currentDateHourZero.getTime() > history.lastTriggered && history.triggered) { history.currentPlayTime = 0 }
        if (history.currentPlayTime >= thresholdLevel && !history.triggered) {
          history.lastTriggered = date.getTime()
          history.triggered = true
          triggerAction = true
        } else if (history.currentPlayTime < thresholdLevel && history.triggered) {
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
  let name = applyMessageSubstitutions(alarmName, context.batteryState, alarmID)
  let message = applyMessageSubstitutions(alarmMessage, context.batteryState, alarmID)
  SteamUtils.notify(name, message, showToast, playSound, sound, 5000) // First toast
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
      await SteamUtils.notify(name, message, showToast, playSound, sound)
    }
  }
  
  switch (triggeredAction) {
    case triggerActions.suspend:
      sleep(5500)
      SteamUtils.suspend()
      console.log(`[${alarmName}]: action triggered, suspending`)
      break
    case triggerActions.shutdown:
      sleep(5500)
      SteamUtils.shutdown()
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
    let history = getAlarmHistory(alarmID)
    let date = new Date()
    history.currentPlayTime = history.currentPlayTime || 0
    history.currentPlayTime = (date.getTime() - (history.lastUpdatedTime || date.getTime())) + history.currentPlayTime // current_playtime + past_playtime
    history.lastUpdatedTime = date.getTime()
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
          let history = getAlarmHistory(alarmID)
          let date = new Date()
          history.lastUpdatedTime = date.getTime()
          let currentDateHourZero = new Date(date.toLocaleDateString())
          let lastTriggeredDate = history.lastTriggered || 0
          if (currentDateHourZero.getTime() > lastTriggeredDate && history.triggered) {
            delete history.currentPlayTime
            history.triggered = false
          }
          setAlarmHistory(alarmID, history)
        }())
        break
      case thresholdTypes.sessionPlaytime:
        (function () {
          let history = getAlarmHistory(alarmID)
          let date = new Date()
          history.sessionStartTime = date.getTime()
          delete history.currentPlayTime
          history.triggered = false
          setAlarmHistory(alarmID, history)
        }())
        break
      default:
    }
  }
}