import {
  SidebarNavigation
} from "decky-frontend-lib"
import { VFC } from "react"
import AlarmList from "./AlarmList"
import GlobalSettings from "./GlobalSettings"
import { FaClock, FaCog, FaInfo } from "react-icons/fa"

const PageRouter: VFC = () => {
  const pages = [
    {
      title: 'Alarm List',
      content: <AlarmList/>,
      // route: '/autosuspend/alarms',
      icon: <FaClock/>,
      hideTitle: true
    },
    {
      title: 'Global Settings',
      content: <GlobalSettings/>,
      // route: '/autosuspend/settings',
      icon: <FaCog/>,
      hideTitle: true
    },
    {
      title: 'Information',
      content: <div>Information</div>,
      icon: <FaInfo/>,
      hideTitle: true
    }
  ]

  return (
    <SidebarNavigation pages={pages} />
  )
}

export default PageRouter