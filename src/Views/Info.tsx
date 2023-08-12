import { CSSProperties, VFC, useEffect, useRef, useState } from "react"
import { DialogBody, DialogControlsSection, Field, Focusable } from "decky-frontend-lib"
import { FaBatteryFull, FaBatteryQuarter, FaBed, FaDotCircle, FaExclamationCircle, FaMinusSquare, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"

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
      tocRefs.current.find(tocRef => tocRef && item.id == tocRef.id)?.ref?.focus()
    }
    let itemProps:any = {
      onClick: onAction
    }
    if (item.indentLevel === undefined) { item.indentLevel = 0 }
    if (!item.sectionTitle) {
      if (item.data) { itemProps.description = item.data }
      if (item.title) { itemProps.label = item.title }
    }
    if (item.sectionTitle) { 
      
      itemProps.children = (
        <span>
          <span style={{marginLeft: `${(item.indentLevel)*indentation}px`}}>{item.data}</span>
          <TopColorBar />
        </span>
      )
      itemProps.onOKButton = onAction
      return (
        <Focusable
          key={i}
          // @ts-ignore
          focusableIfNoChildren={true}
          ref={el => {
            if (item.id) { itemRefs.current[i] = {id: item.id, ref: el} }
          }}
          onOKButton={()=>tocRefs.current.find(itemRef => itemRef && item.id == itemRef.id)?.ref?.focus()}
          onClick={()=>tocRefs.current.find(itemRef => itemRef && item.id == itemRef.id)?.ref?.focus()}
          {...itemProps} />
      )
    } else if (!item.id) { 
      return (
        <div style={{marginLeft: `${(item.indentLevel)*indentation}px`}}>
        <Field
          key={i}
          focusable={true}
          {...itemProps} />
        </div>
      )
    } else {
      return (
        <div style={{marginLeft: `${(item.indentLevel)*indentation}px`}}>
        <Field
          key={i}
          focusable={true}
          style={{marginLeft: `${(item.indentLevel)*indentation}px`}}
          ref={el => {
            if (item.id) { itemRefs.current[i] = {id: item.id, ref: el} }
          }}
          {...itemProps} />
        </div>
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
        onOKButton={()=>itemRefs.current.find(itemRef => itemRef && item.id == itemRef.id)?.ref?.focus()}
        onClick={()=>itemRefs.current.find(itemRef => itemRef && item.id == itemRef.id)?.ref?.focus()}>
        {item.title}
      </Focusable>
    )
  }).filter(n => n !== undefined)
  const tocTitle = (
    <div>
    <Focusable
      // @ts-ignore
      focusableIfNoChildren={true}
      style={{fontSize: "1.2em"}}
      onOKButton={()=>setShowToC(!showToC)}
      onClick={()=>setShowToC(!showToC)}>
      Table of Contents
      <TopColorBar />
    </Focusable>
    {showToC ? tableOfContents : null }
    </div>
  )
  console.log('ToC references: ', tocRefs, '\nContent references: ', itemRefs)
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
      id: "general",
      title: "General",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>General</span>
    },
    {
      id: "alarms-general-alarmname",
      title: "Alarm Name",
      indentLevel: 1,
      data: "Alarm names are user-defined names solely to easily define and differentiate between alarms. Alarms without names will show the UUID associated with the alarm."
    },
    {
      id: "alarms-general-toastmessage",
      title: "Toast Message",
      indentLevel: 1,
      data: "Toast messages are user-defined messages to provide information within the notification sent when the associated alarm is triggered. Refer to the `Message Variables` section for the list of available variable substitutions that can be used within the message."
    },
    {
      id: "alarms-general-profile",
      title: "Profile",
      indentLevel: 1,
      data: "Profile ##FIXME##"
    },
    {
      id: "alarms-thresholdTypes",
      title: "Threshold Types",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Threshold Types</span>
    },
    {
      id: "alarms-thresholdTypes-discharge",
      title: "Discharge",
      indentLevel: 1,
      data: (<span>
        Discharge alarms (<FaBatteryQuarter />) are triggered when the battery level has discharged to the designated percentage threshold and will not trigger again until the battery has been charged above the threshold. These alarms are automatically disabled if no battery is found to prevent instantly triggering.
      </span>)
    },
    {
      id: "alarms-thresholdTypes-overcharge",
      title: "Overcharge",
      indentLevel: 1,
      data: "##FIXME## Overcharge alarms are triggered when the battery level has charged to the designated percentage threshold",
    },
    {
      id: "alarms-thresholdTypes-bedtime",
      title: "Bedtime",
      indentLevel: 1,
      data: "##FIXME## Bedtime alarms are triggered when the current time has reached a certain time of day",
    },
    {
      id: "alarms-thresholdTypes-dailyplaytime",
      title: "Daily Playtime",
      indentLevel: 1,
      data: "##FIXME## Daily playtime alarms are triggered when the console has been actively running until the designated time threshold, resets at midnight, and persists across suspends/reboots",
    },
    {
      id: "alarms-thresholdTypes-sessionplaytime",
      title: "Session Playtime",
      indentLevel: 1,
      data: "##FIXME## Session playtime alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold, and resets when suspended or rebooted",
    },
    {
      id: "alarms-thresholdTypes-downloadComplete",
      title: "Download Complete",
      indentLevel: 1,
      data: "##FIXME## Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted",
    },
    {
      id: "alarms-thresholdTypes-inactivity",
      title: "Inactivity",
      indentLevel: 1,
      data: "##FIXME## Inactivity alarms are triggered when the accumulated time that the console has been inactively running reaches the designated duration threshold, and resets when suspended or rebooted",
    },
    {
      id: "alarms-triggerActions",
      title: "Trigger Actions",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Trigger Actions</span>
    },
    {
      id: "alarms-triggerActions-suspend",
      title: "Suspend",
      indentLevel: 1,
      data: (<span>
        The suspend action (<FaMoon/>) signals the device to suspend when the associated alarm is triggered.
      </span>)
    },
    {
      id: "alarms-triggerActions-shutdown",
      title: "Shutdown",
      indentLevel: 1,
      data: (<span>
        The shutdown action (<FaPowerOff/>) signals the device to shutdown when the associated alarm is triggered.
      </span>)
    },
    {
      id: "messageVariables",
      title: "Message Variables",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Message Variables</span>
    },
    {
      indentLevel: 1,
      data: (<table>
        <tr><td><b>Variable</b></td><td><b>Description</b></td><td><b>Example</b></td></tr>
        <tr><td>batt%</td><td>Displays the battery percentage</td><td>{`"Battery level \{batt%\}%"`}</td></tr>
        <tr><td>playHrs</td><td>Displays the daily/session hour playtime</td><td>{`"You've been playing for {playHrs}h"`}</td></tr>
        <tr><td>playMin</td><td>Displays the daily/session minute playtime</td><td>{`"You've been playing for {playMin}m"`}</td></tr>
        <tr><td>playSec</td><td>Displays the daily/session seconds playtime</td><td>{`"You've been playing for {playSec}s"`}</td></tr>
        <tr><td>{`date:<fmt>`}</td><td>Displays the date/time (python-like format)</td><td>{`"It's now {date:%I:%M}"`}</td></tr>
      </table>)
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