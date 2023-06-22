import { FaBatteryQuarter, FaBatteryThreeQuarters, FaBed, FaCommentAlt, FaCommentSlash, FaExclamationCircle, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { SettingsProps } from "../Utils/Settings"
import { IconContext } from "react-icons"
import { DialogButton, DialogCheckbox, Dropdown, DropdownItem, Focusable, ReorderableEntry, ToggleField, } from "decky-frontend-lib"
import { AlarmSetting, thresholdTypes } from "../Utils/Alarms"
import { useState, CSSProperties, SVGProps, useEffect } from "react"
import { SteamCssVariables } from "../Utils/SteamUtils"
import { useAppContext } from "../Utils/Context"

export type AlarmItemProps<T> = {
  entry: ReorderableEntry<T>
}
export interface EntryProps {
  alarmID: string
  settings: AlarmSetting
  defaults: SettingsProps
}

const SteamChevronDown = (props:SVGProps<SVGSVGElement>) => {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" direction="down"><path fill="currentColor" d="M31 20.3606L18.0204 33L5 20.3606L8.60376 16.8568L18.0204 25.9924L27.4166 16.8568L31 20.3606ZM27.3962 3L18.0204 12.1356L8.62412 3L5 6.50379L18.0204 19.1432L31 6.50379L27.3962 3Z"></path></svg>
}

const SteamCSS: {[key:string]: CSSProperties} = {
  BasicUI: {
    marginLeft: "3ex"
  },
  NotificationGroup: {
    borderBottom: `1px solid ${SteamCssVariables.gpSystemDarkerGrey}`,
    padding: "2px"
  },
  NotificationGroupExpanded: {
    borderBottom: "none",
    padding: "2px",
    marginBottom: "4px",
    backgroundColor: "rgba(59,63,72,.5)",
    borderRadius: SteamCssVariables.gpCornerMedium
  },
  NotificationSection: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  NotificationFeedToggle: {
    marginRight: "5px",
    display: "flex"
  },
  NotificationDescription: {
    flex: 5,
    color: SteamCssVariables.gpSystemLightestGrey
  },
  PrefDetailsToggle: {
    transition: "transform .2s ease-in-out",
    height: "18px",
    marginTop: "4px"
  },
  PrefDetailsSelected: {
    transform: "rotateZ(180deg)"
  },
  NotificationPrefDetails : {
    display: "flex",
    flexDirection: "row",
    backgroundColor: SteamCssVariables.gpSystemDarkerGrey,
    padding: "1ex 0 0 5ex",
    boxShadow: "inset 0px 2px 3px rgba(0,0,0,.5)"
  }
}

export const AlarmItem = (props: AlarmItemProps<EntryProps>) => {
  let ctx = useAppContext()
  let alarmID = props.entry.data!.alarmID
  //let settings = props.entry.data!.settings
  let [settings, setSettings] = useState(ctx.settings.alarms[alarmID])
  let defaults = props.entry.data!.defaults
  let [showToast, setShowToast]     = useState<boolean>( (typeof settings.showToast   != 'undefined') ? settings.showToast    : defaults.defaultShowToast )
  let [playSound, setPlaySound]     = useState<boolean>( (typeof settings.playSound   != 'undefined') ? settings.playSound    : defaults.defaultPlaySound )
  //let [sound, setSound]             = useState<string>(  (typeof settings.sound       != 'undefined') ? settings.sound        : defaults.defaultSound )
  //let [alarmType, setAlarmType]     = useState<string>(  (typeof settings.alarmType   != 'undefined') ? settings.alarmType    : defaults.defaultAlarmType )
  //let [alarmRepeat, setAlarmRepeat] = useState<number>(  (typeof settings.alarmRepeat != 'undefined') ? settings.alarmRepeat  : defaults.defaultAlarmRepeat )
  let [selected, setSelected]       = useState<boolean>(false)
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
    <div style={selected ? SteamCSS.NotificationGroupExpanded : SteamCSS.NotificationGroup}>
      <div style={SteamCSS.NotificationSection}>
        <div style={SteamCSS.NotificationFeedToggle}>
          <ToggleField layout="below" bottomSeparator="none" checked={settings.enabled} onChange={(value) => settings.enabled = value }/>
        </div>
        <div style={SteamCSS.NotificationDescription}>
        {settings.alarmName}
        <IconContext.Provider value={{size: "0.8em"}}>
          <div style={{display:"flex", columnGap: "0.8em"}}>
            {settings.profile ? <FaUser/> : <FaUsers/>}
            {showToast ? <FaCommentAlt/> : <FaCommentSlash/>}
            {playSound ? <FaVolumeUp/> : <FaVolumeMute/>}
            {thresholdType}
            {triggerAction}
          </div>
        </IconContext.Provider>
        </div>
        <DialogButton
          onOKButton={() => setSelected(!selected)}
          style={{width: "7.5%"}}>
          <SteamChevronDown style={selected ? SteamCSS.PrefDetailsToggle : {...SteamCSS.PrefDetailsToggle, ...SteamCSS.PrefDetailsSelected}}/>
        </DialogButton>
      </div>
      { selected ?
        <AlarmItemSettings alarmID={alarmID} />
      : null }
    </div>
  )
}


interface AlarmItemSettingsProps {
  alarmID: string
}
const AlarmItemSettings = (props: AlarmItemSettingsProps) => {
  let ctx = useAppContext()
  let [settings, setSettings] = useState(ctx.settings.alarms[props.alarmID])
  return (
    <div style={SteamCSS.NotificationPrefDetails}>
      <DialogCheckbox
        onChange={(value)=>{
          setSettings({...settings, showToast: !value})
        }}
        label="Checkbox label"
        description="Checkbox description"
        disabled={!settings.enabled}
        bottomSeparator="none"
        checked={settings.showToast}
      />
      <Dropdown
        rgOptions={[
          {label: 'Discharge',        data: thresholdTypes.discharge},
          {label: 'Overcharge',       data: thresholdTypes.overcharge},
          {label: 'Bedtime',          data: thresholdTypes.bedtime},
          {label: 'Daily Playtime',   data: thresholdTypes.dailyPlaytime},
          {label: 'Session Playtime', data: thresholdTypes.sessionPlaytime}
        ]}
        selectedOption={thresholdTypes.discharge}
        onChange={(value)=> setSettings({...settings, thresholdType: value.data})}
        disabled={!settings.enabled}
        menuLabel="Buooong"
        strDefaultLabel="defaults"
        focusable={settings.enabled} />
      <DialogButton onOKButton={()=>{console.log(ctx.settings)}}>Context Settings</DialogButton>
    </div>
  )
}