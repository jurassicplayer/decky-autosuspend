import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib"
import { FaBatteryQuarter } from "react-icons/fa"
//import { AppContextProvider, AppContextState } from "./Plugin/Context"
import QAM from "./Views/QAM"
//import PageRouter from "./Views/PageRouter"

import { Backend } from "./Plugin/BackendContext"
import { SettingsContextProvider } from "./Plugin/SettingsContext"
import { AppContext, AppContextProvider } from "./Plugin/AppContext"

export default definePlugin((serverAPI: ServerAPI) => {
  Backend.initialize(serverAPI)
  let appContext = new AppContext()
  
  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content: (
      <SettingsContextProvider>
        <AppContextProvider appContext={appContext}>
          <QAM/>
        </AppContextProvider>
      </SettingsContextProvider>
    ),
    icon: <FaBatteryQuarter />,
    alwaysRender: true,
    onDismount: () => {
      appContext.onDismount()
    }
  }
})
