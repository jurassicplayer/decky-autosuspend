import { FaBatteryFull, FaBatteryQuarter, FaBed, FaExclamationCircle, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { FaArrowRotateRight } from "react-icons/fa6"
import { BiNotification, BiNotificationOff } from "react-icons/bi"
import { IconContext } from "react-icons"
import { useState, SVGProps, useEffect } from "react"
import { DialogButton, ToggleField } from "decky-frontend-lib"
import { applyDefaults } from "../Utils/Settings"
import { SteamCss } from "../Utils/SteamUtils"
import { useSettingsContext } from "../Utils/Context"
import { AlarmItemProps, EntryProps, LoginUser, ProfileData } from "../Utils/Interfaces"
import { AlarmItemSettings } from "./AlarmSettings"

const SteamChevronDown = (props:SVGProps<SVGSVGElement>) => {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" direction="down"><path fill="currentColor" d="M31 20.3606L18.0204 33L5 20.3606L8.60376 16.8568L18.0204 25.9924L27.4166 16.8568L31 20.3606ZM27.3962 3L18.0204 12.1356L8.62412 3L5 6.50379L18.0204 19.1432L31 6.50379L27.3962 3Z"></path></svg>
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
    case 'discharge':       thresholdTypeIcon = <FaBatteryQuarter/>; break
    case 'overcharge':      thresholdTypeIcon = <FaBatteryFull/>; break
    case 'bedtime':         thresholdTypeIcon = <FaBed/>; break
    case 'dailyPlaytime':   thresholdTypeIcon = <FaSun/>; break
    case 'sessionPlaytime': thresholdTypeIcon = <FaStopwatch/>; break
  }
  let triggerActionIcon: any = <FaExclamationCircle/>
  switch (triggeredAction) {
    case 'suspend':   triggerActionIcon = <FaMoon/>; break
    case 'shutdown':  triggerActionIcon = <FaPowerOff/>; break
    case 'none':      triggerActionIcon = null; break
  }
  return (
    <div style={selected ? SteamCss.NotificationGroupExpanded : SteamCss.NotificationGroup}>
      <div style={SteamCss.NotificationSection}>
        <div style={SteamCss.NotificationFeedToggle}>
          <ToggleField layout="below" bottomSeparator="none" checked={enabled} onChange={(value) => setAlarmSetting(alarmID, 'enabled', value) }/>
        </div>
        <div style={SteamCss.NotificationDescription}>
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
          <SteamChevronDown style={selected ? SteamCss.PrefDetailsToggle : {...SteamCss.PrefDetailsToggle, ...SteamCss.PrefDetailsSelected}}/>
        </DialogButton>
      </div>
      { selected ?
        <AlarmItemSettings alarmID={alarmID} loginUsers={loginUsers}/>
      : null }
    </div>
  )
}


