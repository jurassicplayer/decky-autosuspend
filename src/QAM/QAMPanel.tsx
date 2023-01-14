import {
  ButtonItem,
  Focusable,
  PanelSection,
  PanelSectionRow,
  SliderField,
  staticClasses
} from "decky-frontend-lib"
import { useState, VFC } from "react"
import { Settings } from "../Utils/Settings"
import { NotificationToggles } from "../InputControls/NotificationToggles"

export const QAMPanel: VFC = () => {
  const [showDisabled, setShowDisabled] = useState<boolean>(false)
  const [warningEnabled, setWarningEnabled] = useState<boolean>(Settings.warningEnabled)
  const [criticalEnabled, setCriticalEnabled] = useState<boolean>(Settings.criticalEnabled)
  const [overchargeEnabled, setOverchargeEnabled] = useState<boolean>(Settings.overchargeEnabled)
  const [warningLevel, setWarningLevel] = useState<number>(Settings.warningLevel)
  const [criticalLevel, setCriticalLevel] = useState<number>(Settings.criticalLevel)
  const [overchargeLevel, setOverchargeLevel] = useState<number>(Settings.overchargeLevel)

  const onWarningLevelSlider = (threshold: number) => { setWarningLevel(threshold) }
  const onCriticalLevelSlider = (threshold: number) => { setCriticalLevel(threshold) }
  const onOverchargeLevelSlider = (threshold: number) => { setOverchargeLevel(threshold) }
  const onSaveButton = () => {
    Settings.warningEnabled = warningEnabled
    Settings.criticalEnabled = criticalEnabled
    Settings.overchargeEnabled = overchargeEnabled
    Settings.warningLevel = warningLevel
    Settings.criticalLevel = criticalLevel
    Settings.overchargeLevel = overchargeLevel
    Settings.saveToLocalStorage();
  }

  return (
    <PanelSection>
      <Focusable
        onMenuActionDescription={showDisabled ? "Hide disabled" : "Show disabled"}
        onMenuButton={() => setShowDisabled(!showDisabled)}>
        {showDisabled || warningEnabled
        ? <Focusable
          onSecondaryActionDescription={warningEnabled ? "Disable" : "Enable"}
          onSecondaryButton={() => setWarningEnabled(!warningEnabled)}>
          <PanelSectionRow>
            <SliderField
              label="Warning Level"
              description="Warning notification threshold"
              value={warningLevel}
              step={5}
              max={100}
              min={0}
              showValue={true}
              validValues={(n: number) => 100 >= n && n >= 0 && n == Math.trunc(n)}
              disabled={warningEnabled && warningLevel >= criticalLevel ? false : true}
              editableValue={true}
              onChange={onWarningLevelSlider}
            />
          </PanelSectionRow>
        </Focusable>
        : null }

        {showDisabled || criticalEnabled
        ? <Focusable
          onSecondaryActionDescription={criticalEnabled ? "Disable" : "Enable"}
          onSecondaryButton={() => setCriticalEnabled(!criticalEnabled)}>
          <PanelSectionRow>
            <SliderField
              label="Critical Level"
              description="Device auto-suspend threshold"
              value={criticalLevel}
              step={5}
              max={100}
              min={0}
              showValue={true}
              validValues={(n: number) => 100 >= n && n >= 0 && n == Math.trunc(n)}
              disabled={!criticalEnabled}
              editableValue={true}
              onChange={onCriticalLevelSlider}
            />
          </PanelSectionRow>
        </Focusable>
        : null }

        {showDisabled || overchargeEnabled
        ? <Focusable
          onSecondaryActionDescription={overchargeEnabled ? "Disable" : "Enable"}
          onSecondaryButton={() => setOverchargeEnabled(!overchargeEnabled)}>
          <PanelSectionRow>
            <SliderField
              label="Overcharge Level"
              description="Overcharge notification threshold"
              value={overchargeLevel}
              step={5}
              max={100}
              min={0}
              showValue={true}
              validValues={(n: number) => 100 >= n && n >= 0 && n == Math.trunc(n)}
              disabled={overchargeEnabled && (overchargeLevel > criticalLevel && overchargeLevel > warningLevel) ? false : true}
              editableValue={true}
              onChange={onOverchargeLevelSlider}
            />
          </PanelSectionRow>
        </Focusable>
        : null }

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={onSaveButton}
          >Apply Changes</ButtonItem>
        </PanelSectionRow>

        <div className={staticClasses.PanelSectionTitle}>Notifications</div>
        <PanelSectionRow>
          <NotificationToggles />
        </PanelSectionRow>
      </Focusable>
    </PanelSection>
  );
};