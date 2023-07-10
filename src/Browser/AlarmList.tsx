import { DialogBody, DialogButton, DialogControlsSection, Focusable, ReorderableEntry } from "decky-frontend-lib"
import { CSSProperties, VFC, useEffect } from "react"
import { useSettingsContext } from "../Utils/Context"
import { AlarmItem } from "./AlarmItem"
import { SteamCssVariables } from "../Utils/SteamUtils"
import { FaCog, FaPlusSquare } from "react-icons/fa"
import { BsInfoSquareFill } from "react-icons/bs"
import { Alarms, EntryProps } from "../Utils/Interfaces"
import Spinner from "../InputControls/Spinner"

const buttonCss: CSSProperties = {
  minWidth: "0px",
  width: "4em"
}

export const AlarmList: VFC = () => {
  let { getSetting, getAlarmSettings, getAlarmSetting } = useSettingsContext()
  let alarms: Alarms = getSetting('alarms')
  let entries:ReorderableEntry<EntryProps>[] = []
  useEffect(() => {
    
  }, [])
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
    // @ts-ignore
    let sort = a.position.sortOrder - b.position.sortOrder
    if (sort) { return sort }
    // @ts-ignore
    sort = a.data.alarmName <= b.data.alarmName ? -1 : 1
    return sort
  }).forEach((entry) => { entry.position = entries.indexOf(entry)})
  let alarmList = entries.map((entry) => <AlarmItem entry={entry}/>)
  return (
    <DialogBody>
      <DialogControlsSection style={{marginTop: "40px", padding: SteamCssVariables.gpSpaceGap, paddingTop: "0px", rowGap: SteamCssVariables.gpSpaceGap, backgroundColor: SteamCssVariables.gpSystemDarkestGrey, overflow: "auto", height: "-webkit-fill-available"}}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", rowGap: "1em"}}>
          <span style={{fontSize: "2em"}}>Alarms</span>
          <Focusable style={{display: "flex", flexDirection: "row", alignItems: "center", columnGap: "0.4em"}}>
            <DialogButton style={buttonCss}><FaPlusSquare/></DialogButton>
            <DialogButton style={buttonCss}><FaCog/></DialogButton>
            <DialogButton style={buttonCss}><BsInfoSquareFill/></DialogButton>
          </Focusable>
        </div>
        <Spinner value={0} />
        {alarmList}
      </DialogControlsSection>
    </DialogBody>
  )
}
