import { DialogBody, DialogButton, DialogControlsSection, DialogHeader, DialogSubHeader, Focusable, ReorderableEntry } from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { useAppContext } from "../Utils/Context"
import { AlarmItem, EntryProps } from "./AlarmItem"
import { SteamCssVariables } from "../Utils/SteamUtils"

export const AlarmList: VFC = () => {
  let [appCtx] = useState(useAppContext())
  let { settings } = appCtx
  let entries:ReorderableEntry<EntryProps>[] = []
  useEffect(() => {
    
  }, [])
  for (let alarmID in settings.alarms) {
    let { sortOrder, profile } = settings.alarms[alarmID]
    // @ts-ignore
    if (profile && profile != loginStore.m_strAccountName) { continue }
    entries.push({
      label: '',
      data: {
        alarmID: alarmID,
        settings: settings.alarms[alarmID],
        defaults: settings
      },
      position: sortOrder
    })
  }
  entries.sort((a, b) => {
    // @ts-ignore
    let sort = a.data.settings.sortOrder - b.data.settings.sortOrder
    if (sort) { return sort }
    // @ts-ignore
    sort = a.data.settings.alarmName <= b.data.settings.alarmName ? -1 : 1
    return sort
  }).forEach((entry) => { entry.position = entries.indexOf(entry)})
  let alarmList = entries.map((entry) => <AlarmItem entry={entry}/>)
  console.log(alarmList)
  return (
    <DialogBody><CtxReload/>
      <DialogControlsSection style={{marginTop: "40px", padding: SteamCssVariables.gpSpaceGap, rowGap: SteamCssVariables.gpSpaceGap, backgroundColor: SteamCssVariables.gpSystemDarkestGrey, height: "-webkit-fill-available"}}>
        <DialogSubHeader>Alarms</DialogSubHeader>
        {alarmList}
      </DialogControlsSection>
    </DialogBody>
  )
}

const CtxReload = () => {
  let [ctx] = useState(useAppContext())
  useEffect(()=>{ console.log(ctx.settings) },[])
  return <div />
}