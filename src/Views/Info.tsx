import { CSSProperties, VFC, useEffect, useRef, useState } from "react"
import { useAppContext } from "../Utils/Context"
import { DialogBody, DialogButton, DialogControlsSection, DialogControlsSectionHeader, Field, Focusable } from "decky-frontend-lib"
import { SteamCssVariables } from "../Utils/SteamUtils"

const TopColorBar = () => {
  const topColorBarCSS: CSSProperties = {
    width: "100%",
    height: "1px",
    background: "linear-gradient(to right, #00ccff, #3366ff)"
  }
  return (
    <div className="TopColorBar" style={topColorBarCSS}/>
  )
}


const ContentRenderer = (content: contentElement[]) => {
  const indentation = 8
  const [showToC, setShowToC] = useState<boolean>(false)
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, content.length)
    tocRefs.current = tocRefs.current.slice(0, content.length)
  }, [content])

  const itemRefs = useRef<{id: string, ref: HTMLDivElement|null}[]>([]);
  const elements = content.map((item: contentElement, i: number) => {
    let onAction = () => {
      setShowToC(true)
      tocRefs.current.find(tocRef => item.id == tocRef.id)?.ref?.focus()
    }
    let itemProps:any = {
      onClick: onAction
    }
    if (item.data) { itemProps.description = item.data }
    if (item.title && !item.sectionTitle) { itemProps.label = item.title }
    if (item.sectionTitle) { 
      if (item.indentLevel === undefined) { item.indentLevel = 0 }
      itemProps.children = (<span>{item.data}<TopColorBar /></span>)
      itemProps.onOKButton = onAction
      return (
        <Focusable
          key={i}
          // @ts-ignore
          focusableIfNoChildren={true}
          style={{marginLeft: `${(item.indentLevel+1)*indentation}px`}}
          ref={el => {
            if (item.id) { itemRefs.current[i] = {id: item.id, ref: el} }
          }}
          onOKButton={()=>tocRefs.current.find(itemRef => item.id == itemRef.id)?.ref?.focus()}
          onClick={()=>tocRefs.current.find(itemRef => item.id == itemRef.id)?.ref?.focus()}
          {...itemProps} />
      )
    } else if (!item.id) { 
      return (
        <Field
          key={i}
          focusable={true}
          {...itemProps} />
      )
    } else {
      return (
        <Field
          key={i}
          focusable={true}
          ref={el => {
            if (item.id) { itemRefs.current[i] = {id: item.id, ref: el} }
          }}
          {...itemProps} />
      )
    }
  })

  const tocRefs = useRef<{id: string, ref: HTMLDivElement|null}[]>([]);
  const tableOfContents = content.map((item: contentElement, i: number) => {
    if (!item.id) return
    if (item.indentLevel === undefined) { item.indentLevel = 0 }
    return (
      <Focusable
        key={i}
        // @ts-ignore
        focusableIfNoChildren={true}
        style={{marginLeft: `${(item.indentLevel+1)*indentation}px`}}
        ref={el => {
          if (item.id) { tocRefs.current[i] = {id: item.id, ref: el} }
        }}
        onOKButton={()=>itemRefs.current.find(itemRef => item.id == itemRef.id)?.ref?.focus()}
        onClick={()=>itemRefs.current.find(itemRef => item.id == itemRef.id)?.ref?.focus()}>
        {item.title}
      </Focusable>
    )
  }).filter(n => n !== undefined)
  const tocTitle = (
    <div>
    <Focusable
      // @ts-ignore
      focusableIfNoChildren={true}
      onOKButton={()=>setShowToC(!showToC)}
      onClick={()=>setShowToC(!showToC)}>
      Table of Contents
    </Focusable>
    {showToC ? tableOfContents : null }
    </div>
  )
  return [tocTitle, ...elements]
}

interface contentElement {
  data?: any // react node with any content data
  title?: string // the label shown above the description and in the table of contents
  sectionTitle?: boolean // use to disable the label in the content
  id?: string // field ID (currently not automatically generated, but could be)
  indentLevel?: number  // indentation level
}

const Info: VFC = () => {
  const contents: contentElement[] = [
    {
      data: <h1>Alarm Types</h1>,
      sectionTitle: true,
      title: "Alarm Types",
      id: "alarmTypes"
    },
    {
      data: "Discharge alarms are triggered when the battery level has discharged to the designated percentage threshold",
      title: "Discharge",
      id: "alarmTypes-discharge",
      indentLevel: 1
    },
    {
      data: "Overcharge alarms are triggered when the battery level has charged to the designated percentage threshold",
      title: "Overcharge",
      id: "alarmTypes-overcharge",
      indentLevel: 1
    },
    {
      data: "Bedtime alarms are triggered when the current time has reached a certain time of day",
      title: "Bedtime",
      id: "alarmTypes-bedtime",
      indentLevel: 1
    },
    {
      data: "Daily playtime alarms are triggered when the console has been actively running until the designated time threshold, resets at midnight, and persists across suspends/reboots",
      title: "Daily Playtime",
      id: "alarmTypes-dailyplaytime",
      indentLevel: 1
    },
    {
      data: "Session playtime alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold, and resets when suspended or rebooted",
      title: "Session Playtime",
      id: "alarmTypes-sessionplaytime",
      indentLevel: 1
    },
    {
      data: "Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted",
      title: "Download Complete",
      id: "alarmTypes-downloadComplete",
      indentLevel: 1
    }
  ]


  return (
    <DialogBody>
      <DialogControlsSection>
        {ContentRenderer(contents)}
      </DialogControlsSection>
    </DialogBody>
  )
}

export default Info