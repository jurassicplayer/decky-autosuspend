import {
  DialogButton,
  Focusable,
  Navigation
} from "decky-frontend-lib"
import { VFC } from "react"
import { useAppContext } from "../../Utils/Context"

const QAMPanel: VFC = () => {
  const { activeRoutes } = useAppContext()
  const NavigateToPage = (path:string) => {
    if (!activeRoutes.includes(path)) { return }
    Navigation.Navigate(path)
    Navigation.CloseSideMenus()
  }
  
  return (
    <Focusable>
      <DialogButton onClick={()=>NavigateToPage("/autosuspend")}>Configuration</DialogButton>
      {/* <DialogButton onClick={()=>NavigateToPage("/autosuspend/information")}>Information</DialogButton>
      <DialogButton onClick={()=>NavigateToPage("/autosuspend/about")}>About</DialogButton> */}
    </Focusable>
  )
}

export default QAMPanel