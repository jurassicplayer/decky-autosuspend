import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  staticClasses
} from "decky-frontend-lib"
import { useState, VFC } from "react"
import { Settings } from "../Utils/Settings"
import { NotificationToggles } from "../InputControls/NotificationToggles"

export const QAMPanel: VFC = () => {
  const [warningLevel, setWarningLevel] = useState<number>(Settings.warningLevel)
  const [criticalLevel, setCriticalLevel] = useState<number>(Settings.criticalLevel)

  const onWarningLevelSlider = (threshold: number) => { setWarningLevel(threshold) }
  const onCriticalLevelSlider = (threshold: number) => { setCriticalLevel(threshold) }
  const onSaveButton = () => {
    Settings.warningLevel = warningLevel;
    Settings.criticalLevel = criticalLevel;
    Settings.saveToLocalStorage();
  }

  return (
    <PanelSection>
      <PanelSectionRow>
        <SliderField
          label="Warning Level"
          description="Threshold before sending warning notification"
          value={warningLevel}
          step={5}
          max={100}
          min={0}
          showValue={true}
          disabled={warningLevel >= criticalLevel? false : true}
          editableValue={true}
          onChange={onWarningLevelSlider}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <SliderField
          label="Critical Level"
          description="Threshold before suspending device"
          value={criticalLevel}
          step={5}
          max={100}
          min={0}
          showValue={true}
          editableValue={true}
          onChange={onCriticalLevelSlider}
        />
      </PanelSectionRow>

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
    </PanelSection>
  );
};