import { DialogBody, DialogButton, DialogControlsSection, Focusable, ReorderableEntry } from "decky-frontend-lib"
import { CSSProperties, VFC, useState } from "react"
import { useSettingsContext } from "../Utils/Context"
import { AlarmItem } from "./AlarmItem"
import { SteamCssVariables } from "../Utils/SteamUtils"
import { FaCog, FaPlusSquare } from "react-icons/fa"
import { BsInfoSquareFill } from "react-icons/bs"
import { AlarmSetting, Alarms, EntryProps, thresholdTypes, triggerActions } from "../Utils/Interfaces"

const buttonCss: CSSProperties = {
  minWidth: "0px",
  width: "4em"
}

const newAlarmSettings: AlarmSetting = {
  enabled: false,
  alarmName: "",
  thresholdLevel: 15,
  thresholdType: thresholdTypes.discharge,
  triggeredAction: triggerActions.none,
  sound: 'ToastMisc',
  sortOrder: 0
}

function uuidv4() {
  // @ts-ignore
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export const AlarmList: VFC = () => {
  let { getSetting, getAlarmSettings, getAlarmSetting, addAlarm } = useSettingsContext()
  let [alarms, setAlarms] = useState<Alarms>(getSetting('alarms'))
  let entries:ReorderableEntry<EntryProps>[] = []
  
  let onAddAlarm = () => {
    let alarmID = uuidv4()
    let sortOrders = Object.entries(alarms).map(([alarmID, alarmSettings]) => alarmSettings.sortOrder)
    let lastSortOrder = Math.max(...sortOrders)
    let alarmSettings = {...newAlarmSettings, sortOrder: lastSortOrder+1}
    addAlarm(alarmID, alarmSettings)
    setAlarms(getSetting('alarms'))
  }
  
  for (let alarmID in alarms) {
    let { sortOrder, profile } = getAlarmSettings(alarmID)
    // @ts-ignore
    if (profile && profile != loginStore.m_strAccountName) { continue }
    entries.push({
      label: '',
      data: {
        alarmID: alarmID,
        alarmName: getAlarmSetting(alarmID, 'alarmName')
      },
      position: sortOrder
    })
  }
  entries.sort((a, b) => {
    let sort = a.position - b.position
    if (sort) { return sort }
    // @ts-ignore
    sort = a.data.alarmName <= b.data.alarmName ? -1 : 1
    return sort
  }).forEach((entry) => { entry.position = entries.indexOf(entry)})
  let alarmList = entries.map((entry) => <AlarmItem entry={entry} setAlarms={setAlarms}/>)
  return (
    <DialogBody>
      <DialogControlsSection style={{marginTop: "40px", padding: SteamCssVariables.gpSpaceGap, paddingTop: "0px", rowGap: SteamCssVariables.gpSpaceGap, backgroundColor: SteamCssVariables.gpSystemDarkestGrey, overflow: "auto", height: "-webkit-fill-available"}}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", rowGap: "1em"}}>
          <span style={{fontSize: "2em"}}>Alarms</span>
          <Focusable style={{display: "flex", flexDirection: "row", alignItems: "center", columnGap: "0.4em"}}>
            <DialogButton style={buttonCss} onClick={()=>onAddAlarm()}><FaPlusSquare/></DialogButton>
            {/* <DialogButton style={buttonCss}><FaCog/></DialogButton>
            <DialogButton style={buttonCss}><BsInfoSquareFill/></DialogButton> */}
          </Focusable>
        </div>
        {alarmList}
      </DialogControlsSection>
    </DialogBody>
  )
}
