import { Focusable, useParams } from "decky-frontend-lib"
import { VFC, useEffect } from "react"

export const AlarmSettings: VFC = () => {
  const { alarmID } = useParams<any>()
  useEffect(() => {
    console.log('Alarm Settings page loaded')
    console.log(alarmID)
  }, [])
  useEffect(() => () => {
    console.log('Alarm Settings page unloaded')
  }, [])
  return (
    <Focusable
      style={{marginTop: "40px"}}>
      Alarm Settings
      {alarmID}
    </Focusable>
  )
}