import { FaBatteryFull, FaBatteryQuarter, FaBed, FaExclamationCircle, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { FaArrowRotateRight } from "react-icons/fa6"
import { BiNotification, BiNotificationOff } from "react-icons/bi"
import { IconContext } from "react-icons"
import { DialogButton, DropdownItem, ReorderableEntry, TextField, ToggleField } from "decky-frontend-lib"
import { applyDefaults, thresholdTypes, triggerActions } from "../Utils/Alarms"
import { useState, CSSProperties, SVGProps, useEffect } from "react"
import { NavSoundMap, SteamCssVariables, SteamUtils } from "../Utils/SteamUtils"
import { useSettingsContext } from "../Utils/Context"
import { thresholdLevelDefaults } from "../Utils/Settings"

export type AlarmItemProps<T> = {
  entry: ReorderableEntry<T>
}
export interface EntryProps {
  alarmID: string
  alarmName: string
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
    flexDirection: "column",
    backgroundColor: SteamCssVariables.gpSystemDarkerGrey,
    padding: "1ex 0 0 5ex",
    boxShadow: "inset 0px 2px 3px rgba(0,0,0,.5)",
    flexWrap: "wrap"
  }
}

export const AlarmItem = (props: AlarmItemProps<EntryProps>) => {
  let alarmID = props.entry.data!.alarmID
  let { getSettings, getAlarmSettings, setAlarmSetting } = useSettingsContext()
  let { enabled, alarmName, profile, showToast, playSound, alarmRepeat, thresholdType, triggeredAction } = applyDefaults(getAlarmSettings(alarmID), getSettings())
  let [selected, setSelected] = useState<boolean>(false)
  let [loginUsers, setLoginUsers] = useState<LoginUser[]>([])
  let [profileData, setProfileData] = useState<ProfileData>()
  useEffect(()=>{
    async function init(){
      let loginUsers: LoginUser[] = await SteamClient.User.GetLoginUsers()
      setLoginUsers(loginUsers)
      if (profile) {
        let profileData = loginUsers.find((user)=>user.accountName == profile)
        if (profileData) {
          setProfileData({ personaName: profileData.personaName, avatarUrl: profileData.avatarUrl })
        }
      }
    }
    init()
  },[])

  
  let thresholdTypeIcon = <FaExclamationCircle/>
  switch (thresholdType) {
    case 'discharge':
      thresholdTypeIcon = <FaBatteryQuarter/>
      break
    case 'overcharge':
      thresholdTypeIcon = <FaBatteryFull/>
      break
    case 'bedtime':
      thresholdTypeIcon = <FaBed/>
      break
    case 'dailyPlaytime':
      thresholdTypeIcon = <FaSun/>
      break
    case 'sessionPlaytime':
      thresholdTypeIcon = <FaStopwatch/>
      break
  }
  let triggerActionIcon: any = <FaExclamationCircle/>
  switch (triggeredAction) {
    case 'suspend':
      triggerActionIcon = <FaMoon/>
      break
    case 'shutdown':
      triggerActionIcon = <FaPowerOff/>
      break
    case 'none':
      triggerActionIcon = null
      break
  }
  return (
    <div style={selected ? SteamCSS.NotificationGroupExpanded : SteamCSS.NotificationGroup}>
      <div style={SteamCSS.NotificationSection}>
        <div style={SteamCSS.NotificationFeedToggle}>
          <ToggleField layout="below" bottomSeparator="none" checked={enabled} onChange={(value) => setAlarmSetting(alarmID, 'enabled', value) }/>
        </div>
        <div style={SteamCSS.NotificationDescription}>
        {alarmName}
        <IconContext.Provider value={{size: "0.8em"}}>
          <div style={{display:"flex", columnGap: "0.8em"}}>
            {profile ?
              <div style={{ display: "flex", alignContent: "center" }}>
                {profileData && profileData.avatarUrl ? <img src={profileData.avatarUrl} style={{width:"0.8em", height:"0.8em"}}/>: <FaUser/>}
                <span style={{ fontSize: "0.6em", marginLeft: "0.7em" }}>{profileData?.personaName}</span>
              </div>
            : <div style={{ display: "flex", alignContent: "center" }}>
                <FaUsers/><span style={{ fontSize: "0.6em", marginLeft: "0.7em" }}>Global</span>
              </div>
            }
            {showToast ? <BiNotification/> : <BiNotificationOff/>}
            {playSound ? <FaVolumeUp/> : <FaVolumeMute/>}
            {alarmRepeat ? <FaArrowRotateRight/> : null}
            {thresholdTypeIcon}
            {triggerActionIcon}
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
        <AlarmItemSettings alarmID={alarmID} loginUsers={loginUsers}/>
      : null }
    </div>
  )
}


interface AlarmItemSettingsProps {
  alarmID: string
  loginUsers: LoginUser[]
}
interface ProfileData {
  personaName: string
  avatarUrl: string
}
interface LoginUser extends ProfileData{
  accountName: string
  rememberPassword: boolean
}
const AlarmItemSettings = (props: AlarmItemSettingsProps) => {
  let { getSettings, getAlarmSettings, setAlarmSettings, setAlarmSetting, deleteAlarmSetting } = useSettingsContext()
  let { enabled, showToast, playSound, sound, alarmName, alarmMessage, repeatToast, repeatSound, alarmRepeat, thresholdLevel, thresholdType, triggeredAction, profile, sortOrder } = applyDefaults(getAlarmSettings(props.alarmID), getSettings())
  let loginUsers: {label: string, data: LoginUser | null}[] = props.loginUsers.map((userData: LoginUser) => {
    return {label: userData.personaName, data: userData}
  })
  loginUsers.unshift({label: "Global", data: null})
  return (
    <div style={SteamCSS.NotificationPrefDetails}>
      <div style={{display: "flex", flexDirection: "row"}}>
        <ToggleField
          onChange={(value) => setAlarmSetting(props.alarmID, 'showToast', value)}
          label="Toast"
          description="Show toast notification"
          disabled={!enabled}
          bottomSeparator="none"
          checked={showToast}
        />
        <ToggleField
          onChange={(value) => setAlarmSetting(props.alarmID, 'playSound', value)}
          label="Sound"
          description="Play toast sound"
          disabled={!enabled}
          bottomSeparator="none"
          checked={playSound}
        />
        <DropdownItem
          rgOptions={(()=>{
            let options = []
            for (let key in NavSoundMap) {
              let sfx = NavSoundMap[key]
              if (typeof sfx != 'string') { continue }
              options.push({
                label: sfx.replace(/([A-Z])/g, ' $1').trim(),
                data: sfx
              })
            }
            return options
          })()}
          selectedOption={sound}
          onChange={(value)=> {
            setAlarmSetting(props.alarmID, 'sound', value.data)
          }}
          disabled={!enabled}
          label={<span>Notification Sound:<span style={{fontSize: "0.8em", marginLeft: "0.8em"}}>Sound effect to use when alarm triggered</span></span>}
          menuLabel="Notification Sound"
          strDefaultLabel="Error"
          focusable={enabled} />
      </div>
      <div style={{display: "flex", flexDirection: "row"}}>
        <ToggleField
            onChange={(value) => setAlarmSetting(props.alarmID, 'repeatToast', value)}
            label="Repeat Toast"
            description="Repeat toast notification"
            disabled={!enabled}
            bottomSeparator="none"
            checked={repeatToast}
          />
        <ToggleField
          onChange={(value) => setAlarmSetting(props.alarmID, 'repeatSound', value)}
          label="Repeat Sound"
          description="Repeat sound notification"
          disabled={!enabled}
          bottomSeparator="none"
          checked={repeatSound}
        />
        <DropdownItem
          rgOptions={(()=>{
            let options = []
            for (let i=0; i <= 9; i++) {
              options.push({label: i.toString(), data: i})
            }
            return options
          })()}
          selectedOption={alarmRepeat || 0}
          onChange={(value)=> {
            setAlarmSetting(props.alarmID, 'alarmRepeat', value.data)
          }}
          disabled={!enabled}
          label={<span>Repeat notification:<span style={{fontSize: "0.8em", marginLeft: "0.8em"}}>Number of times to repeat notification</span></span>}
          menuLabel="Repeat Notification"
          strDefaultLabel="Error"
          focusable={enabled} />
      </div>
      <DropdownItem
        rgOptions={[
          {label: 'Discharge',        data: thresholdTypes.discharge},
          {label: 'Overcharge',       data: thresholdTypes.overcharge},
          {label: 'Bedtime',          data: thresholdTypes.bedtime},
          {label: 'Daily Playtime',   data: thresholdTypes.dailyPlaytime},
          {label: 'Session Playtime', data: thresholdTypes.sessionPlaytime}
        ]}
        selectedOption={thresholdType}
        onChange={(value) => {
          let alarmSettings = getAlarmSettings(props.alarmID)
          alarmSettings.thresholdType = value.data
          alarmSettings.thresholdLevel = thresholdLevelDefaults[value.data]
          setAlarmSettings(props.alarmID, alarmSettings)
        }}
        disabled={!enabled}
        label={<span>Threshold Type:<span style={{fontSize: "0.8em", marginLeft: "0.8em"}}>Type of threshold to trigger alarm</span></span>}
        menuLabel="Threshold Type"
        strDefaultLabel="Error"
        focusable={enabled} />
      <div>
        <DropdownItem
          rgOptions={[
            {label: '', data: ''}
          ]}
          selectedOption={''}
          onChange={(value) => {
            console.log(value)
          }}/>
      </div>
      <DropdownItem
        rgOptions={[
          {label: 'None',     data: triggerActions.none},
          {label: 'Suspend',  data: triggerActions.suspend},
          {label: 'Shutdown', data: triggerActions.shutdown}
        ]}
        selectedOption={triggeredAction}
        onChange={(value)=> setAlarmSetting(props.alarmID, 'triggeredAction', value.data)}
        disabled={!enabled}
        label={<span>Trigger Action:<span style={{fontSize: "0.8em", marginLeft: "0.8em"}}>Action to perform when alarm triggered</span></span>}
        menuLabel="Trigger Action"
        strDefaultLabel="Error"
        focusable={enabled} />
      <DropdownItem
        rgOptions={loginUsers}
        selectedOption={loginUsers.find((user)=>user.data && user.data.accountName == profile)?.data || null}
        onChange={(value)=> value.data ? setAlarmSetting(props.alarmID, 'profile', value.data.accountName): deleteAlarmSetting(props.alarmID, 'profile') }
        disabled={!enabled}
        label={<span>Profile:<span style={{fontSize: "0.8em", marginLeft: "0.8em"}}>Apply this alarm only for the specified Steam user</span></span>}
        menuLabel="Per Profile"
        strDefaultLabel="Error"
        focusable={enabled} />
      <TextField
        label="Alarm Name"
        description="Name of the alarm"
        bShowClearAction={true}
        value={alarmName}
        onChange={(e)=> setAlarmSetting(props.alarmID, 'alarmName', e.target.value)} />
      <TextField
        label="Alarm Message"
        description="Message displayed on alarm toast"
        bShowClearAction={true}
        value={alarmMessage}
        onChange={(e)=> {
          if (e.target.value != '') {
            setAlarmSetting(props.alarmID, 'alarmMessage', e.target.value)
          } else {
            deleteAlarmSetting(props.alarmID, 'alarmMessage')
          }
        }} />
      <DialogButton onOKButton={()=>{SteamUtils.notify(alarmName, alarmMessage, showToast, playSound, sound)}}>Test Notification</DialogButton>
      <DialogButton onOKButton={()=>{console.log(getAlarmSettings(props.alarmID))}}>Context Settings</DialogButton>
    </div>
  )
}