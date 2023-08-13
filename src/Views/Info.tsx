import { CSSProperties, VFC, useEffect, useRef, useState } from "react"
import { DialogBody, DialogControlsSection, Field, Focusable } from "decky-frontend-lib"
import { FaBatteryFull, FaBatteryQuarter, FaBed, FaDotCircle, FaExclamationCircle, FaMinusSquare, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { BiNotification, BiNotificationOff } from "react-icons/bi"

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
      data: "Toast messages are user-defined messages to provide information within the notification sent when the associated alarm is triggered. Refer to the `Message Directives` section for the list of available directives that can be used within the message."
    },
    {
      id: "alarms-general-profile",
      title: "Profile",
      indentLevel: 1,
      data: (<span>
        Alarms can be associated with and trigger for a user-defined Steam user (<FaUser/>) or all users (<FaUsers/>).
      </span>)
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
      data: (<span>
        Overcharge alarms (<FaBatteryFull/>) are triggered when the battery level has charged to the designated percentage threshold and will not trigger again until the battery has been discharged below the threshold. These alarms are automatically disabled if no battery is found to prevent instantly triggering.
      </span>),
    },
    {
      id: "alarms-thresholdTypes-bedtime",
      title: "Bedtime",
      indentLevel: 1,
      data: (<span>
        Bedtime alarms (<FaBed/>) are triggered at the user-defined time of the current day and will not trigger again until the date has changed.
      </span>)
    },
    {
      id: "alarms-thresholdTypes-dailyplaytime",
      title: "Daily Playtime",
      indentLevel: 1,
      data: (<span>
        Daily playtime alarms (<FaSun/>) are triggered when the device has been actively running for a user-defined amount of time and will not trigger again until the date has changed. The actively running duration is persisted across suspends and reboots. Ex: A threshold at 4 hours allows for 4 hours of activity anytime throughout the current day before triggering.
      </span>)
    },
    {
      id: "alarms-thresholdTypes-sessionplaytime",
      title: "Session Playtime",
      indentLevel: 1,
      data: (<span>
        Session playtime alarms (<FaStopwatch/>) are triggered when the device has been actively running for a user-defined amount of time and will not trigger again until the next session. The actively running duration is reset after suspends and reboots. Ex: A threshold at 2 hours allows for 2 hours of uninterrupted activity (no suspend/shutdown) before triggering.
      </span>)
    },
    {
      id: "alarms-thresholdTypes-downloadComplete",
      title: "Download Complete",
      indentLevel: 1,
      data: (<span>
        Download complete alarms () are triggered when no inputs are detected for a user-defined amount of time after finishing a download queue. This alarm is always evaluated when enabled.
      </span>)
    },
    {
      id: "alarms-thresholdTypes-inactivity",
      title: "Inactivity",
      indentLevel: 1,
      data: (<span>
        Inactivity alarms () are triggered when no inputs are detected for a user-defined amount of time. This alarm is always evaluated when enabled.
      </span>)
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
      id: "notifications",
      title: "Notifications",
      data: <span style={{fontSize: "1.2em"}}>Notifications</span>
    },
    {
      title: "Show Toast",
      indentLevel: 1,
      data: (<span>
        ##FIXME## (<BiNotification/>/<BiNotificationOff/>)
      </span>)
    },
    {
      title: "Play Sound",
      indentLevel: 1,
      data: (<span>
        ##FIXME## (<FaVolumeUp/>/<FaVolumeMute/>)
      </span>)
    },
    {
      id: "messageDirectives",
      title: "Message Directives",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Message Directives</span>
    },
    {
      indentLevel: 1,
      data: (<table>
        <tr><td><b>Directive</b></td><td><b>Description</b></td><td><b>Example</b></td></tr>
        <tr><td>batt%</td><td>Displays the battery percentage</td><td>{`"Battery level \{batt%\}%"`}</td></tr>
        <tr><td>playHrs</td><td>Displays the daily/session hour playtime</td><td>{`"You've been playing for {playHrs}h"`}</td></tr>
        <tr><td>playMin</td><td>Displays the daily/session minute playtime</td><td>{`"You've been playing for {playMin}m"`}</td></tr>
        <tr><td>playSec</td><td>Displays the daily/session seconds playtime</td><td>{`"You've been playing for {playSec}s"`}</td></tr>
        <tr><td>{`date:<fmt>`}</td><td>Displays the date/time (python-like format)</td><td>{`"It's now {date:%I:%M}"`}</td></tr>
      </table>)
    },
    {
      id: "dateformat",
      title: "Date Format",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Date Format</span>
    },
    {
      indentLevel: 1,
      data: (<table>##FIXME##
        <tr><td><b>Directive</b></td><td><b>Description</b></td><td><b>Example</b></td></tr>
        <tr><td>%a</td><td>Weekday, short version</td><td>Wed</td></tr>
        <tr><td>%A</td><td>Weekday, full version</td><td>Wednesday</td></tr>
        <tr><td>%w</td><td>Weekday as a number 0-6, 0 is Sunday</td><td>3</td></tr>
        <tr><td>%d</td><td>Day of month 01-31</td><td>31</td></tr>
        <tr><td>%b</td><td>Month name, short version</td><td>Dec</td></tr>
        <tr><td>%B</td><td>Month name, full version</td><td>December</td></tr>
        <tr><td>%m</td><td>Month as a number 01-12</td><td>12</td></tr>
        <tr><td>%y</td><td>Year, short version without century</td><td>18</td></tr>
        <tr><td>%Y</td><td>Year, full version</td><td></td>2018</tr>
        <tr><td>%H</td><td>Hour 00-23</td><td>17</td></tr>
        <tr><td>%I</td><td>Hour 00-12</td><td>05</td></tr>
        <tr><td>%p</td><td>AM/PM</td><td>PM</td></tr>
        <tr><td>%M</td><td>Minute 00-59</td><td>41</td></tr>
        <tr><td>%S</td><td>Second 00-59</td><td>08</td></tr>
        <tr><td>%f</td><td>Microsecond 000000-999999</td><td>548513</td></tr>
        <tr><td>%z</td><td>UTC offset</td><td>+0100</td></tr>
        <tr><td>%Z</td><td>Timezone</td><td>CST</td></tr>
        <tr><td>%j</td><td>Day number of year 001-366</td><td>365</td></tr>
        <tr><td>%U</td><td>Week number of year, Sunday as the first day of week, 00-53</td><td>52</td></tr>
        <tr><td>%W</td><td>Week number of year, Monday as the first day of week, 00-53</td><td>52</td></tr>
        <tr><td>%c</td><td>Local version of date and time</td><td></td></tr>
        <tr><td>%C</td><td>Century</td><td>20</td></tr>
        <tr><td>%x</td><td>Local version of date</td><td>12/31/18</td></tr>
        <tr><td>%X</td><td>Local version of time</td><td>17:41:00</td></tr>
        <tr><td>%%</td><td>A literal "%" character</td><td>%</td></tr>
        <tr><td>%G</td><td>ISO 8601 year</td><td>2018</td></tr>
        <tr><td>%u</td><td>ISO 8601 weekday (1-7)</td><td>1</td></tr>
        <tr><td>%V</td><td>ISO 8601 weeknumber (01-53)</td><td>01</td></tr>
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