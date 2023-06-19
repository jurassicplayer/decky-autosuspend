import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  ReorderableEntry,
  Navigation
} from "decky-frontend-lib"
import { AlarmSetting } from "../Utils/Alarms"
import { useState, VFC } from "react"
import { useAppContext } from "../Utils/Context"
import { FaBatteryQuarter, FaBatteryThreeQuarters, FaBed, FaCog, FaCommentAlt, FaCommentSlash, FaExclamationCircle, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { SettingsProps } from "../Utils/Settings"
import { IconContext } from "react-icons"

type AlarmItemProps<T> = {
  entry: ReorderableEntry<T>
}
interface EntryProps {
  alarmID: string
  settings: AlarmSetting
  defaults: SettingsProps
}
const openSettings = (alarmID?: string) => {
  console.log(`Opening settings page for ${alarmID}`)
  Navigation.Navigate(`/autosuspend/alarm/${alarmID}`)
  console.log(`Completed navigation`)
  Navigation.CloseSideMenus()
}
const AlarmItem = (props: AlarmItemProps<EntryProps>) => {
  let alarmID = props.entry.data!.alarmID
  let settings = props.entry.data!.settings
  let defaults = props.entry.data!.defaults
  let [showToast, setShowToast]     = useState<boolean>( (typeof settings.showToast   != 'undefined') ? settings.showToast    : defaults.defaultShowToast )
  let [playSound, setPlaySound]     = useState<boolean>( (typeof settings.playSound   != 'undefined') ? settings.playSound    : defaults.defaultPlaySound )
  //let [sound, setSound]             = useState<string>(  (typeof settings.sound       != 'undefined') ? settings.sound        : defaults.defaultSound )
  //let [alarmType, setAlarmType]     = useState<string>(  (typeof settings.alarmType   != 'undefined') ? settings.alarmType    : defaults.defaultAlarmType )
  //let [alarmRepeat, setAlarmRepeat] = useState<number>(  (typeof settings.alarmRepeat != 'undefined') ? settings.alarmRepeat  : defaults.defaultAlarmRepeat )
  let thresholdType = <FaExclamationCircle/>
  switch (settings.thresholdType) {
    case 'discharge':
      thresholdType = <FaBatteryQuarter/>
      break
    case 'overcharge':
      thresholdType = <FaBatteryThreeQuarters/>
      break
    case 'bedtime':
      thresholdType = <FaBed/>
      break
    case 'dailyPlaytime':
      thresholdType = <FaSun/>
      break
    case 'sessionPlaytime':
      thresholdType = <FaStopwatch/>
      break
  }
  let triggerAction: any = <FaExclamationCircle/>
  switch (settings.triggeredAction) {
    case 'suspend':
      triggerAction = <FaMoon/>
      break
    case 'shutdown':
      triggerAction = <FaPowerOff/>
      break
    case 'none':
      triggerAction = null
      break
  }
  return (
    <DialogButton
      onOKButton={() => {openSettings(alarmID)}}
      style={{display:"flex", flexDirection: "column"}}
    >
      <span>{settings.alarmName}</span>
      <div style={{display: "flex", justifyContent: "space-between", width: "-webkit-fill-available"}}>
      <IconContext.Provider value={{size: "0.7em"}}>
        <div style={{display:"flex", columnGap: "0.2em"}}>
          {settings.profile ? <FaUser/> : <FaUsers/>}
        </div>
        <div style={{display:"flex", columnGap: "0.2em"}}>
          {showToast ? <FaCommentAlt/> : <FaCommentSlash/>}
          {playSound ? <FaVolumeUp/> : <FaVolumeMute/>}
          {thresholdType}
          {triggerAction}
        </div>
      </IconContext.Provider>
      </div>
    </DialogButton>
  )
}

export const QAMPanel: VFC = () => {
  let appCtx = useAppContext()
  let { settings } = appCtx
  let entries:ReorderableEntry<EntryProps>[] = []
  
  for (let alarmID in settings.alarms) {
    let { sortOrder, profile } = settings.alarms[alarmID]
    // @ts-ignore
    if (profile && profile != loginStore.m_strAccountName) { continue }
    entries.push({
      label: '',
      data: {
        alarmID: alarmID,
        settings: settings.alarms[alarmID],
        defaults: settings
      },
      position: sortOrder
    })
  }
  entries.sort((a, b) => {
    // @ts-ignore
    let sort = a.data.settings.sortOrder - b.data.settings.sortOrder
    if (sort) { return sort }
    // @ts-ignore
    sort = a.data.settings.alarmName <= b.data.settings.alarmName ? -1 : 1
    return sort
  }).forEach((entry) => { entry.position = entries.indexOf(entry)})
  console.log(entries)
  let alarmItems = entries.map((entry) => <AlarmItem entry={entry}/>)
  return (
    <PanelSection>
      <PanelSectionRow>
        <Focusable>
          <DialogButton
            onOKButton={()=>{
              Navigation.Navigate("/autosuspend/alarms")
              Navigation.CloseSideMenus()
            }}
          >
            <FaCog/>
          </DialogButton>
          { alarmItems }
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  );
};