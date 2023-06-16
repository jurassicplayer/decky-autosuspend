import {
  ButtonItem,
  Focusable,
  PanelSection,
  PanelSectionRow,
  staticClasses
} from "decky-frontend-lib"
import { useState, VFC } from "react"
import { NotificationToggles } from "../InputControls/NotificationToggles"

export const QAMPanel: VFC = () => {
  return (
    <PanelSection>
      <Focusable>
        <ButtonItem>Alarm Name and simple information</ButtonItem>
      </Focusable>
    </PanelSection>
  );
};