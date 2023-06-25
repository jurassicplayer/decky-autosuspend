import { DialogButton, DropdownItem, TextField, ToggleField } from "decky-frontend-lib"
import { AlarmItemSettingsProps, LoginUser, thresholdTypes, triggerActions } from "../Utils/Interfaces"
import { NavSoundMap, SteamCss, SteamUtils } from "../Utils/SteamUtils"
import { useSettingsContext } from "../Utils/Context"
import { applyDefaults, thresholdLevelDefaults } from "../Utils/Settings"

export const AlarmItemSettings = (props: AlarmItemSettingsProps) => {
  let { getSettings, getAlarmSettings, setAlarmSettings, setAlarmSetting, deleteAlarmSetting } = useSettingsContext()
  let { enabled, showToast, playSound, sound, alarmName, alarmMessage, repeatToast, repeatSound, alarmRepeat, thresholdLevel, thresholdType, triggeredAction, profile, sortOrder } = applyDefaults(getAlarmSettings(props.alarmID), getSettings())
  let loginUsers: {label: string, data: LoginUser | null}[] = props.loginUsers.map((userData: LoginUser) => {
    return {label: userData.personaName, data: userData}
  })
  loginUsers.unshift({label: "Global", data: null})
  return (
    <div style={SteamCss.NotificationPrefDetails}>
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