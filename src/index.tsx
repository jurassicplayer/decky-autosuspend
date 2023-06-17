import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib"
import { FaBatteryQuarter } from "react-icons/fa"
import { QAMPanel } from "./QAM/QAMPanel"
import { alarmTypes, SettingsManager, triggerActions } from "./Utils/Settings"
import { SteamUtils } from "./Utils/SteamUtils"
import { events } from "./Utils/Events"
import { AppContextProvider, AppContextState } from "./Utils/Context"

import { AlarmSetting, thresholdTypes } from './Utils/Settings'
const evaluateAlarm = async (alarmID: string, settings: AlarmSetting, context: AppContextState) => {
  let { showToast, playSound, sound, alarmType, alarmRepeat, alarmName, alarmMessage, thresholdLevel, thresholdType, triggeredAction, enabled, profile } = settings
  if (!enabled) { return }
  // @ts-ignore
  if (profile && profile != loginStore.m_strAccountName) { return }
  let history = SettingsManager.getAlarmHistory(alarmID) || { triggered: false }
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
      const minute = 1000 * 60
      const hour = minute * 60
      const day = hour * 24
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
  SettingsManager.setAlarmHistory(alarmID, history)
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

const OnSuspend = (context: AppContextState) => {
  let alarms = context.settings.alarms
  for (let alarmID in alarms) {
    let {thresholdType} = alarms[alarmID]
    if (thresholdType != thresholdTypes.dailyPlaytime) { continue }
    let history = SettingsManager.getAlarmHistory(alarmID) || { triggered: false }
    let now = Date.now()
    //history = history ? history : { triggered: false }
    history.currentPlayTime = (history.currentPlayTime || 0) + (now - (history.sessionStartTime || now))
    delete history.sessionStartTime
    SettingsManager.setAlarmHistory(alarmID, history)
  }
  console.log(`OnSuspend triggered: ${appInstance}`)
}
const OnResume = (context: AppContextState) => {
  let alarms = context.settings.alarms
  for (let alarmID in alarms) {
    let {thresholdType} = alarms[alarmID]
    if (thresholdType != thresholdTypes.dailyPlaytime) { continue }
    let history = SettingsManager.getAlarmHistory(alarmID) || { triggered: false }
    //history = history ? history : { triggered: false }
    history.sessionStartTime = Date.now()
    SettingsManager.setAlarmHistory(alarmID, history)
  }
  console.log(`OnResume triggered: ${appInstance}`)
}

export default definePlugin((serverApi: ServerAPI) => {
  let appCtx = new AppContextState(serverApi)
  /* ##FIXME## On context initialization:
    check for dailyPlaytime alarms
    set sessionStartTime
    reset currentPlayTime if current date is larger than lastTriggered date
      will need to take into account timezones again
  */
  const IntervalCheck = (e: Event) => {
    if (!appCtx.appInfo.initialized) { return }
    let alarms = appCtx.settings.alarms
    for (let alarmID in alarms) {
      evaluateAlarm(alarmID, alarms[alarmID], appCtx)
    }
  }
  let appInstance = Math.random()
  appCtx.eventBus.addEventListener(events.BatteryStateEvent.eType, IntervalCheck)
  appCtx.eventBus.addEventListener(events.SuspendEvent.eType, () => OnSuspend(appCtx))
  appCtx.eventBus.addEventListener(events.ResumeEvent.eType, () => OnResume(appCtx))

  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content:  <AppContextProvider appContextState={appCtx}><QAMPanel /></AppContextProvider>,
    icon: <FaBatteryQuarter />,
    onDismount: () => {
      appCtx.eventBus.removeEventListener(events.BatteryStateEvent.eType, IntervalCheck)
      appCtx.eventBus.removeEventListener(events.SuspendEvent.eType, () => OnSuspend(appInstance))
      appCtx.eventBus.removeEventListener(events.ResumeEvent.eType, () => OnResume(appInstance))
      appCtx.onDismount()
    }
  }
})
