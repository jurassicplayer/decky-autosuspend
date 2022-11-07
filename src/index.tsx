import {
  definePlugin,
  ToggleField,
  SliderField,
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses
} from "decky-frontend-lib";
import { BatteryState } from "./lib/SteamClient";
import { VFC, useState, useEffect } from "react";
import { FaBatteryQuarter } from "react-icons/fa";
import { loadSettingsFromLocalStorage, Settings, saveSettingsToLocalStorage } from "./settings";
import { Backend } from "./utils";

let settings: Settings;

const Content: VFC<{ settings: Settings }> = ({ settings }) => {
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(settings.notificationEnabled);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [warningLevel, setWarningLevel] = useState<number>(settings.warningLevel);
  const [criticalLevel, setCriticalLevel] = useState<number>(settings.criticalLevel);
  const [saveButton, setSaveButton] = useState<boolean>(false);

  useEffect(() => {
    if (!saveButton) return
    settings.warningLevel = warningLevel;
    settings.criticalLevel = criticalLevel;
    saveSettingsToLocalStorage(settings);
    setSaveButton(false);
  }, [saveButton]);
  useEffect(() => {
    settings.notificationEnabled = notificationEnabled;
    settings.soundEnabled = soundEnabled;
    saveSettingsToLocalStorage(settings);
  }, [notificationEnabled, soundEnabled]);
  

  return (
    <PanelSection>
      <PanelSectionRow>
        <ToggleField
          label="Notification"
          checked={notificationEnabled}
          onChange={(notificationEnabled) => {
            setNotificationEnabled(notificationEnabled);
          }}
        />
        <ToggleField
          label="Sound"
          checked={soundEnabled}
          onChange={(soundEnabled) => {
            setSoundEnabled(soundEnabled);
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <SliderField
          label="Warning Level"
          description="Control the threshold before sending warning notification"
          value={warningLevel}
          step={5}
          max={100}
          min={0}
          showValue={true}
          disabled={warningLevel >= criticalLevel? false : true}
          notchTicksVisible={true}
          onChange={(threshold: number) => {
            setWarningLevel(threshold);
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <SliderField
          label="Critical Level"
          description="Control the threshold before suspending device"
          value={criticalLevel}
          step={5}
          max={100}
          min={0}
          showValue={true}
          notchTicksVisible={true}
          onChange={(threshold: number) => {
            setCriticalLevel(threshold);
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            setSaveButton(true);
          }}
        >Apply Changes</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  const backend = new Backend(serverApi);
  let warnNotifiedState = false;
  let criticalNotifiedState = false;

  // load settings
  settings = loadSettingsFromLocalStorage();

  // percentage check loop
  SteamClient.System.RegisterForBatteryStateChanges((batteryState: BatteryState)=> {
    let batteryPercent = Math.round(batteryState.flLevel * 100)
    /*
    console.log('batt:'+batteryPercent+
      ' audio: '+settings.soundEnabled+
      ' warn: '+settings.warningLevel+
      ' critical: '+settings.criticalLevel);
    //*/
    if (!criticalNotifiedState && batteryPercent < settings.criticalLevel ) {
      backend.notify("AutoSuspend", "Critical limit exceeded, suspending device", settings.notificationEnabled, settings.soundEnabled, 5000);
      setTimeout(() => {backend.suspend();}, 6000);
      criticalNotifiedState = true;
    } else if (!warnNotifiedState && batteryPercent < settings.warningLevel && settings.warningLevel > settings.criticalLevel) {
      backend.notify("AutoSuspend", "Warning limit exceeded", settings.notificationEnabled, settings.soundEnabled);
      warnNotifiedState = true;
    }
    if (criticalNotifiedState && batteryPercent > settings.criticalLevel) {
      criticalNotifiedState = false;
    }
    if (warnNotifiedState && batteryPercent > settings.warningLevel) {
      warnNotifiedState = false;
    }
  })

  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content: <Content settings={settings} />,
    icon: <FaBatteryQuarter />,
  };
});
