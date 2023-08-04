import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib"
import { FaBatteryQuarter } from "react-icons/fa"
import { events } from "./Utils/Events"
import { AppContextProvider, AppContextState } from "./Utils/Context"
import { evaluateAlarm } from "./Utils/Alarms"
import QAM from "./Views/QAM"
import PageRouter from "./Views/PageRouter"

export default definePlugin((serverApi: ServerAPI) => {
  let appCtx = new AppContextState(serverApi)
  const IntervalCheck = () => {
    if (!appCtx.appInfo.initialized || !appCtx.appInfo.processAlarms) { return }
    let alarms = appCtx.settings.alarms
    for (let alarmID in alarms) {
      evaluateAlarm(alarmID, alarms[alarmID], appCtx)
    }
  }
  appCtx.eventBus.addEventListener(events.BatteryStateEvent.eType, IntervalCheck)
  appCtx.registerRoute("/autosuspend", PageRouter, true)
  
  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content:  <AppContextProvider appContextState={appCtx}><QAM /></AppContextProvider>,
    icon: <FaBatteryQuarter />,
    onDismount: () => {
      appCtx.eventBus.removeEventListener(events.BatteryStateEvent.eType, IntervalCheck)
      appCtx.onDismount()
    }
  }
})
