import {
  DialogButton,
  Focusable,
  Navigation
} from "decky-frontend-lib"
import { VFC } from "react"


const NavigateToAlarms = () => {
  Navigation.Navigate("/autosuspend/alarms")
  Navigation.CloseSideMenus()
}
export const QAMPanel: VFC = () => {
  return (
    <Focusable>
      <DialogButton onOKButton={NavigateToAlarms} />
    </Focusable>
  )
}