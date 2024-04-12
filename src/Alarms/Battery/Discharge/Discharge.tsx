import { VFC, useState } from "react";
import { HookType } from "../../../Plugin/Hooks";
import { IAlarm, IAlarmSetting, IHistory, IMetadata } from "../../Alarms.h"
import { FaBatteryQuarter } from "react-icons/fa";
import { DialogButton, Focusable } from "decky-frontend-lib";

const defaults: IAlarmSetting = {
  showToast: true,
  playSound: true,
  sound: "ToastMisc",
  repeatToast: false,
  repeatSound: false,
  repeatAlarm: 0,
  id: "",
  toastTitle: "Discharge",
  toastMessage: "",
  thresholdLevel: 0,
  thresholdType: "discharge",
  triggerActions: [],
  sortOrder: 0,
  enabled: true
}

var history: IHistory = {
  triggered: false,
  lastTriggered: 0
}

export class DischargeAlarm implements IAlarm {
  metadata: IMetadata = metadata
  defaults: IAlarmSetting = defaults
  settings: IAlarmSetting = defaults
  history: IHistory = history
  hooks: HookType[] = [HookType.RegisterForBatteryStateChangesPseudo]
  canEval: () => boolean = () => {
    return false
  }
  evaluate: () => boolean = () => {
    return false
  }
  settingsComponent: VFC<{alarmSettings: IAlarmSetting}> = settingComponent
  constructor(alarmSettings?: IAlarmSetting) {
    // Check localStorage for history data and load
    // this.history = 
    // Check if alarm settings passed into constructor
    if (alarmSettings === undefined) alarmSettings = defaults
    this.settings = alarmSettings
    console.log(`Creating Discharge alarm`)
  }
}

const settingComponent: VFC<{alarmSettings: IAlarmSetting}> = ({alarmSettings}) => {
  const [settings, setSettings] = useState<IAlarmSetting>(alarmSettings)
  const test = () => {
    console.log(`Alarm settings: `, settings)
  }
  return (
    <Focusable>
      <DialogButton onClick={()=>test()}>{settings.toastTitle}</DialogButton>
    </Focusable>
  )
}

const metadata: IMetadata = {
  name: "Discharge",
  type: "discharge",
  icon: <FaBatteryQuarter />,
  class: DischargeAlarm
}

export default metadata