import {
  DialogBody,
  DialogControlsSection,
  DropdownItem,
  DropdownOption,
  ToggleField
} from "decky-frontend-lib"
import { VFC } from "react"
import { useAppContext, useSettingsContext } from "../../Utils/Context"
import { CustomCss, NavSoundMap } from "../../Utils/SteamUtils"

const GlobalSettings: VFC = () => {
  const {} = useAppContext()
  const { getSettings, setSetting } = useSettingsContext()
  const { defaultShowToast, defaultPlaySound, defaultSound, defaultAlarmRepeat, defaultRepeatToast, defaultRepeatSound, debuggingMode } = getSettings()

  return (
    <DialogBody>
      <DialogControlsSection> 
        <ToggleField
          onChange={(value) => setSetting('defaultShowToast', value)}
          label="Toast:"
          description="Enable toast on notification by default"
          bottomSeparator="none"
          checked={defaultShowToast} />
        <ToggleField
          onChange={(value) => setSetting('defaultPlaySound', value)}
          label="Sound:"
          description="Enable sound on notification by default"
          bottomSeparator="none"
          checked={defaultPlaySound} />
        <DropdownItem
          rgOptions={(()=>{
            let options: DropdownOption[] = []
            for (let key in NavSoundMap) {
              let sfx = NavSoundMap[key]
              if (typeof sfx != 'string') { continue }
              options.push({
                label: sfx.replace(/([A-Z])/g, ' $1').trim(),
                data: sfx
              })
            }
            return options
          })()}
          selectedOption={defaultSound}
          onChange={(value)=> setSetting('defaultSound', value.data)}
          label="Notification Sound:"
          description="SteamOS navigation sound effect to play on notification by default"
          bottomSeparator="none"
          strDefaultLabel="Error" />
        { debuggingMode ?
        <div>
          <ToggleField
            onChange={(value) => setSetting('defaultRepeatToast', value)}
            label="Repeat Toast"
            description="Enable repeat toast on notification by default"
            bottomSeparator="none"
            checked={defaultRepeatToast} />
          <ToggleField
            onChange={(value) => setSetting('defaultRepeatSound', value)}
            label="Repeat Sound"
            description="Enable repeat sound on notification by default"
            bottomSeparator="none"
            checked={defaultRepeatSound} />
          <DropdownItem
            rgOptions={(()=>{
              let options: DropdownOption[] = []
              for (let i=0; i <= 9; i++) {
                options.push({label: i.toString(), data: i})
              }
              return options
            })()}
            selectedOption={defaultAlarmRepeat}
            onChange={(value)=> setSetting('defaultAlarmRepeat', value.data)}
            label="Repeat notification:"
            description="Number of times to repeat notification"
            bottomSeparator="none"
            strDefaultLabel="Error" />
        </div>
        : null }
      </DialogControlsSection>
    </DialogBody>
  )
}

export default GlobalSettings