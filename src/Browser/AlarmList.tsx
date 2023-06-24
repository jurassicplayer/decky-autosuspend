import { DialogBody, DialogControlsSection, DialogSubHeader, ReorderableEntry } from "decky-frontend-lib"
import { VFC, useEffect } from "react"
import { useSettingsContext } from "../Utils/Context"
import { AlarmItem, EntryProps } from "./AlarmItem"
import { SteamCssVariables } from "../Utils/SteamUtils"
import { Alarms } from "../Utils/Alarms"

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
      <DialogControlsSection style={{marginTop: "40px", padding: SteamCssVariables.gpSpaceGap, rowGap: SteamCssVariables.gpSpaceGap, backgroundColor: SteamCssVariables.gpSystemDarkestGrey, height: "-webkit-fill-available"}}>
        <DialogSubHeader>Alarms</DialogSubHeader>
        {alarmList}
      </DialogControlsSection>
    </DialogBody>
  )
}
