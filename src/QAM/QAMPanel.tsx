import {
  DialogButton,
  Focusable,
  Navigation
} from "decky-frontend-lib"
import { VFC } from "react"
import Spinner from "../InputControls/Spinner"


const NavigateToAlarms = () => {
  Navigation.Navigate("/autosuspend/alarms")
  Navigation.CloseSideMenus()
}
export const QAMPanel: VFC = () => {
  return (
    <Focusable>
      <DialogButton onOKButton={NavigateToAlarms}>Settings</DialogButton>
      <Spinner value={0} />
    </Focusable>
  )
}