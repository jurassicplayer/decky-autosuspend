import {
  SidebarNavigation
} from "decky-frontend-lib"
import { VFC } from "react"
// import AlarmList from "./AlarmList"
// import GlobalSettings from "./GlobalSettings"
// import Info from "./Info"
import About from "./About"
import { /*FaClock, FaCog, FaInfo,*/ FaPuzzlePiece } from "react-icons/fa"

const PageRouter: VFC = () => {
  const pages = [
    // {
    //   title: 'Alarm List',
    //   content: <AlarmList/>,
    //   // route: '/autosuspend/alarms',
    //   icon: <FaClock/>,
    //   hideTitle: false
    // },
    // {
    //   title: 'Global Settings',
    //   content: <GlobalSettings/>,
    //   // route: '/autosuspend/settings',
    //   icon: <FaCog/>,
    //   hideTitle: false
    // },
    // {
    //   title: 'Information',
    //   content: <Info/>,
    //   icon: <FaInfo/>,
    //   hideTitle: false
    // },
    {
      title: 'About',
      content: <About/>,
      icon: <FaPuzzlePiece/>,
      hideTitle: false
    }
  ]

  return (
    <SidebarNavigation pages={pages} />
  )
}

export default PageRouter