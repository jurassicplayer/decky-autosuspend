import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib"
import { FaBatteryQuarter } from "react-icons/fa"
import QAM from "./Views/QAM"
//import PageRouter from "./Views/PageRouter"

import { Backend } from "./Plugin/Backend"
import { AppContextProvider, AppContextState } from "./Plugin/AppContext"

export default definePlugin((serverAPI: ServerAPI) => {
  Backend.initialize(serverAPI)
  
  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content: (
      <AppContextProvider>
        <QAM/>
      </AppContextProvider>
    ),
    icon: <FaBatteryQuarter />,
    onDismount: () => {
      new AppContextState().onDismount()
    }
  }
})
