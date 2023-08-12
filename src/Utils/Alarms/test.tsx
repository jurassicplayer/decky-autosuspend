import { VFC, useState } from "react"
import { useAppContext } from "../../Utils/Context"
import { DialogBody, DialogButton, DialogControlsSection, DialogControlsSectionHeader, Field, Focusable, ReorderableEntry } from "decky-frontend-lib"
import { AlarmItem, EntryProps } from "../../Views/AlarmList/AlarmItemParentDependence"
import { AlarmSetting, Alarms } from "../Interfaces"
import { eAlarmType } from "../Alarm"

interface alarmSettingShim {
  id: string
  settings: AlarmSetting
}


const Test: VFC = () => {
  const ctx = useAppContext()
  const [alarms, setAlarms] = useState(ctx.alarms)
  const setAlarmsWrapper = (data: Alarms) => {
    let alarmsSettings: alarmSettingShim[] = []
    for (let alarmID in data) {
      let alarm = {
        id: alarmID,
        settings: data[alarmID]
      }
      alarmsSettings.push(alarm)
    }
    let changedAlarms = alarms.filter(alarm => {
      alarmsSettings.filter(alarmSetting => alarmSetting.id == alarm.id && eAlarmType[alarmSetting.settings.thresholdType as keyof typeof eAlarmType] != alarm.setting.thresholdType)
    })
    console.log(changedAlarms)

    setAlarms(alarms => {
      return alarms
    })
  }
  let entries: ReorderableEntry<EntryProps>[] = []
  alarms.map(alarm => {
    let alarmID = alarm.id
    let alarmName = alarm.setting.alarmName
    let sortOrder = alarm.setting.sortOrder
    entries.push({
      label: '',
      data: {
        alarmID: alarmID,
        alarmName: alarmName,
        alarm: alarm
      },
      position: sortOrder
    })
  })
  entries.sort((a, b) => {
    let sort = a.position - b.position
    if (sort) { return sort }
    // @ts-ignore
    sort = a.data.alarmName <= b.data.alarmName ? -1 : 1
    return sort
  }).forEach((entry) => { entry.position = entries.indexOf(entry)})
  console.log('Alarm Entries: ', entries)
  let alarmList = entries.map(entry => <AlarmItem entry={entry} setAlarms={setAlarmsWrapper} />)
  return (
    <DialogBody>
      <DialogControlsSection>
        {alarmList}
        <DialogButton onClick={()=>{
          setAlarms(previous => {
            let index = 6
            return [
              ...previous.slice(0,index),
              previous[index].toDownloadAlarm(),
              ...previous.slice(index+1)
            ]
          })
        }}>
        </DialogButton>
      </DialogControlsSection>
    </DialogBody>
  )
}

export default Test