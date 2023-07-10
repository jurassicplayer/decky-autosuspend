import { DialogButton, TextField } from "decky-frontend-lib"
import { ItemProps } from "decky-frontend-lib/dist/deck-components/Item"
import { CSSProperties, RefAttributes, VFC, useEffect, useState } from "react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"

const styles: {[key:string]: CSSProperties} = {
  miniButton: {padding: "0px", marginTop: "0.6em", marginBottom: "0.6em", minWidth: "0px", width: "2.5em"}
}


interface SpinnerCommonProps extends RefAttributes<HTMLDivElement> {
  style?: CSSProperties
  className?: string
}
interface SpinnerProps extends ItemProps, SpinnerCommonProps {
  value: number
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  disabled?: boolean
  editableValue?: boolean
  validValues?: 'steps' | 'range' | ((value: number) => boolean)
  valueSuffix?: string
  onChange?(value: number): void
  focusable?: boolean
  btnStyle?: CSSProperties
}

const Spinner: VFC<SpinnerProps> = (props) => {
  let { value, min, max, step, showValue, disabled, editableValue, validValues, valueSuffix,
    onChange, focusable, label, description, style, className, btnStyle } = props
  disabled = disabled || false
  const componentStep = step || 1
  const componentValueSuffix = valueSuffix || ''
  let buttonStyle = {...styles.miniButton, btnStyle}
  let [componentValue, setComponentValue] = useState<number>(value)
  useEffect(() => {
    if (onChange) {onChange(componentValue)}
    }, [componentValue])
  function onIncrement(e:Event) {
    let newValue = componentValue + componentStep
    if (max && newValue > max) { newValue = max }
    setComponentValue(newValue)
  }
  async function onDecrement(e:Event) {
    let newValue = componentValue - componentStep
    if (min && newValue < min) { newValue = min }
    setComponentValue(newValue)
  }
  return (
  <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
    <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
      <span>{label}</span>
      <span>{description}</span>
    </div>
    <div style={{display: "flex", flexDirection: "row", columnGap: "0.3em"}}>
      <TextField
        value={`${componentValue}${componentValueSuffix}`}
        mustBeNumeric={true}
        rangeMin={min}
        rangeMax={max}
        onChange={e => setComponentValue(e.target.valueAsNumber)}
        style={{flex: 1, minWidth: "64px", borderRadius: "3px", padding: "4px 8px 4px 8px"}}
        disabled={disabled}/>
      <DialogButton style={buttonStyle} disabled={disabled}
        onOKButton={(e)=>onIncrement(e)}><FaArrowUp/></DialogButton>
      <DialogButton style={buttonStyle} disabled={disabled} onOKButton={(e)=>onDecrement(e)}><FaArrowDown/></DialogButton>
    </div>
  </div>
  )
}

export default Spinner