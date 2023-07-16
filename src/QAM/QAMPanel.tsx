import {
  DialogButton,
  Focusable,
  Navigation
} from "decky-frontend-lib"
import { VFC } from "react"
import { useAppContext } from "../Utils/Context"

export const QAMPanel: VFC = () => {
  const { activeRoutes } = useAppContext()
  const NavigateToPage = (path:string) => {
    if (!activeRoutes.includes(path)) { return }
    Navigation.Navigate(path)
    Navigation.CloseSideMenus()
  }
  
  return (
    <Focusable>
      <DialogButton onClick={()=>NavigateToPage("/autosuspend/alarms")}>Alarm List</DialogButton>
      {/* <DialogButton onClick={()=>NavigateToPage("/autosuspend/settings")}>Global Settings</DialogButton>
      <DialogButton onClick={()=>NavigateToPage("/autosuspend/information")}>Information</DialogButton>
      <DialogButton onClick={()=>NavigateToPage("/autosuspend/about")}>About</DialogButton> */}
    </Focusable>
  )
}