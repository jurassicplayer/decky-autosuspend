import { DialogButton, DropdownItem, NotchLabel, SliderField, TextField, ToggleField } from "decky-frontend-lib"
import { AlarmItemSettingsProps, LoginUser, thresholdLevels, thresholdTypes, triggerActions } from "../Utils/Interfaces"
import { NavSoundMap, SteamCss, SteamUtils } from "../Utils/SteamUtils"
import { useSettingsContext } from "../Utils/Context"
import { applyDefaults, thresholdLevelDefaults } from "../Utils/Settings"
import { CSSProperties, useState } from "react"

const descriptionCss: CSSProperties = {
  fontSize: "0.8em",
  marginLeft: "0.8em"
}

const applyThresholdValue = (thresholdLevels: thresholdLevels, thresholdType: thresholdTypes, value: number): thresholdLevels => {
  switch (thresholdType) {
    case thresholdTypes.discharge: thresholdLevels.discharge = value; break
    case thresholdTypes.overcharge: thresholdLevels.overcharge = value; break
    case thresholdTypes.bedtime: thresholdLevels.bedtime = value; break
    case thresholdTypes.dailyPlaytime: thresholdLevels.dailyPlaytime = value; break
    case thresholdTypes.sessionPlaytime: thresholdLevels.sessionPlaytime = value; break
  }
  return thresholdLevels
}
const getThresholdValue = (thresholdLevels: thresholdLevels, thresholdType: thresholdTypes): number => {
  switch (thresholdType) {
    case thresholdTypes.discharge: return thresholdLevels.discharge
    case thresholdTypes.overcharge: return thresholdLevels.overcharge
    case thresholdTypes.bedtime: return thresholdLevels.bedtime
    case thresholdTypes.dailyPlaytime: return thresholdLevels.dailyPlaytime
    case thresholdTypes.sessionPlaytime: return thresholdLevels.sessionPlaytime
  }
}

export const AlarmItemSettings = (props: AlarmItemSettingsProps) => {
  let { getSettings, getSetting, getAlarmSettings, setAlarmSettings, setAlarmSetting, deleteAlarmSetting } = useSettingsContext()
  let { enabled, showToast, playSound, sound, alarmName, alarmMessage, repeatToast, repeatSound, alarmRepeat, thresholdLevel, thresholdType, triggeredAction, profile, sortOrder } = applyDefaults(getAlarmSettings(props.alarmID), getSettings())
  let loginUsers: {label: string, data: LoginUser | null}[] = props.loginUsers.map((userData: LoginUser) => {
    return {label: userData.personaName, data: userData}
  })
  loginUsers.unshift({label: "Global", data: null})
  let [componentState, setComponentState] = useState<thresholdLevels>(applyThresholdValue(thresholdLevelDefaults, thresholdType, thresholdLevel))
  return (
    <div style={{...SteamCss.NotificationPrefDetails, padding: "1ex 1ex 0 2ex"}}>
      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <span>Alarm Name:</span>
        <div style={{maxWidth: "80%", flexGrow: 1, marginLeft: "0.8em"}}>
          <TextField
          bShowClearAction={true}
          value={alarmName}
          onChange={(e)=> setAlarmSetting(props.alarmID, 'alarmName', e.target.value)} />
        </div>
      </div>
      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <span>Toast Message:</span>
        <div style={{maxWidth: "80%", flexGrow: 1, marginLeft: "0.8em"}}>
          <TextField
            style={{flexGrow: 1}}
            bShowClearAction={true}
            value={alarmMessage}
            onChange={(e)=> {
              if (e.target.value != '') { setAlarmSetting(props.alarmID, 'alarmMessage', e.target.value)
              } else { deleteAlarmSetting(props.alarmID, 'alarmMessage') }
            }} />
        </div>
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
        disabled={enabled}
        label={<span>Threshold Type:<span style={descriptionCss}>Type of threshold to trigger alarm</span></span>}
        bottomSeparator="none"
        strDefaultLabel="Error"
        focusable={!enabled} />
      <div>
        { !enabled && (thresholdType === thresholdTypes.discharge || thresholdType === thresholdTypes.overcharge) ? 
          <SliderField
            label="Threshold Level"
            description="Add thy threshold level description here ##FIXME##"
            value={getThresholdValue(componentState, thresholdType)}
            min={0}
            max={100}
            step={1}
            notchCount={5}
            notchLabels={(()=>{
              let labels:NotchLabel[] = []
              let sliderMax = 100
              let divisor = 4
              for (let i=0;i<11;i++) {
                labels.push({notchIndex: i, label: (i*(sliderMax/divisor)).toString()})
              }
              return labels
            })()}
            showValue={true}
            disabled={enabled}
            editableValue={true}
            validValues='range'
            valueSuffix="%"
            onChange={(value)=>{
              setAlarmSetting(props.alarmID, 'thresholdLevel', value)
              let state = applyThresholdValue(componentState, thresholdType, value)
              setComponentState(state)
            }}
            />
        : null}
        { thresholdType === thresholdTypes.bedtime || thresholdType === thresholdTypes.dailyPlaytime || thresholdType === thresholdTypes.sessionPlaytime ?
          <DropdownItem
            rgOptions={[{label: '', data: ''}]}
            selectedOption={''}
            label="Threshold Level"
            description="Add thy threshold level description here ##FIXME##"
            disabled={enabled}
            focusable={!enabled}/>
        : null}
        { enabled && (thresholdType === thresholdTypes.discharge || thresholdType === thresholdTypes.overcharge) ? 
          <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <span>Threshold Level: <span>Add thy threshold level description here ##FIXME##</span></span>
            <span>{getThresholdValue(componentState, thresholdType)}</span>
          </div>
        : null}
      </div>
      <DropdownItem
        rgOptions={[
          {label: 'None',     data: triggerActions.none},
          {label: 'Suspend',  data: triggerActions.suspend},
          {label: 'Shutdown', data: triggerActions.shutdown}
        ]}
        selectedOption={triggeredAction}
        onChange={(value)=> setAlarmSetting(props.alarmID, 'triggeredAction', value.data)}
        disabled={enabled}
        label={<span>Trigger Action:<span style={descriptionCss}>Action to perform when alarm triggered</span></span>}
        bottomSeparator="none"
        strDefaultLabel="Error"
        focusable={!enabled} />
      <DropdownItem
        rgOptions={loginUsers}
        selectedOption={loginUsers.find((user)=>user.data && user.data.accountName == profile)?.data || null}
        onChange={(value)=> value.data ? setAlarmSetting(props.alarmID, 'profile', value.data.accountName): deleteAlarmSetting(props.alarmID, 'profile') }
        label={<span>Profile:<span style={descriptionCss}>Apply this alarm only for the specified Steam user</span></span>}
        bottomSeparator="none"
        strDefaultLabel="Error"/>
      <h3>Notification</h3>
      <ToggleField
        onChange={(value) => setAlarmSetting(props.alarmID, 'showToast', value)}
        label="Toast"
        description="Enable toast on notification"
        bottomSeparator="none"
        checked={showToast} />
      <ToggleField
        onChange={(value) => setAlarmSetting(props.alarmID, 'playSound', value)}
        label="Sound"
        description="Enable sound on notification"
        bottomSeparator="none"
        checked={playSound} />
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
        onChange={(value)=> { setAlarmSetting(props.alarmID, 'sound', value.data) }}
        label={<span>Notification Sound:<span style={descriptionCss}>SteamOS navigation sound effect to play on notification</span></span>}
        bottomSeparator="none"
        strDefaultLabel="Error" />
      <DialogButton
        style={{minWidth: "0px", width: "10em", alignSelf: "flex-end"}}
        onOKButton={()=>{SteamUtils.notify(alarmName, alarmMessage, showToast, playSound, sound, 1000)}}>Test</DialogButton>
      { getSetting('debuggingMode') ?
      <div style={{display: "flex", flexDirection: "row"}}>
        <ToggleField
            onChange={(value) => setAlarmSetting(props.alarmID, 'repeatToast', value)}
            label="Repeat Toast"
            description="Repeat toast notification"
            bottomSeparator="none"
            checked={repeatToast} />
        <ToggleField
          onChange={(value) => setAlarmSetting(props.alarmID, 'repeatSound', value)}
          label="Repeat Sound"
          description="Repeat sound notification"
          bottomSeparator="none"
          checked={repeatSound} />
        <DropdownItem
          rgOptions={(()=>{
            let options = []
            for (let i=0; i <= 9; i++) {
              options.push({label: i.toString(), data: i})
            }
            return options
          })()}
          selectedOption={alarmRepeat || 0}
          onChange={(value)=> { setAlarmSetting(props.alarmID, 'alarmRepeat', value.data) }}
          label={<span>Repeat notification:<span style={descriptionCss}>Number of times to repeat notification</span></span>}
          bottomSeparator="none"
          strDefaultLabel="Error" />
        <DialogButton onOKButton={()=>{console.log(getAlarmSettings(props.alarmID))}}>Context Settings</DialogButton>
      </div>
      : null }
    </div>
  )
}