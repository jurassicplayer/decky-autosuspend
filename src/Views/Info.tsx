import { CSSProperties, VFC, useEffect, useRef, useState } from "react"
import { DialogBody, DialogControlsSection, Field, Focusable } from "decky-frontend-lib"
import { FaBatteryFull, FaBatteryQuarter, FaBed, FaMoon, FaPowerOff, FaStopwatch, FaSun, FaUser, FaUsers, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
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
      id: "general-alarmname",
      title: "Alarm Name",
      indentLevel: 1,
      data: "Alarm names are user-defined names solely to easily define and differentiate between alarms. Alarms without names will show the UUID associated with the alarm."
    },
    {
      id: "general-toastmessage",
      title: "Toast Message",
      indentLevel: 1,
      data: "Toast messages are user-defined messages to provide information within the notification sent when the associated alarm is triggered. Refer to the `Message Directives` section for the list of available directives that can be used within the message."
    },
    {
      id: "general-profile",
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
    // {
    //   id: "alarms-thresholdTypes-downloadComplete",
    //   title: "Download Complete",
    //   indentLevel: 1,
    //   data: (<span>
    //     Download complete alarms () are triggered when no inputs are detected for a user-defined amount of time after finishing a download queue. This alarm is always evaluated when enabled.
    //   </span>)
    // },
    // {
    //   id: "alarms-thresholdTypes-inactivity",
    //   title: "Inactivity",
    //   indentLevel: 1,
    //   data: (<span>
    //     Inactivity alarms () are triggered when no inputs are detected for a user-defined amount of time. This alarm is always evaluated when enabled.
    //   </span>)
    // },
    {
      id: "alarms-thresholdLevel",
      title: "Threshold Level",
      data: "Threshold levels are the user-defined thresholds for each alarm and are either specific battery percentages (discharge/overcharge), time of day (bedtime), or duration (daily/session). Threshold types and levels can only be edited while the alarm is disabled to prevent accidentally triggering while modifying alarms."
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
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Notifications</span>
    },
    {
      id: "notifications-showtoast",
      title: "Show Toast",
      indentLevel: 1,
      data: (<span>
        Enable (<BiNotification/>)/Disable (<BiNotificationOff/>) toast on notification. This setting will follow the "Toast" global setting until manually configured.
      </span>)
    },
    {
      id: "notifications-playsound",
      title: "Play Sound",
      indentLevel: 1,
      data: (<span>
        Enable (<FaVolumeUp/>)/Disable (<FaVolumeMute/>) sound on notification. This setting will follow the "Sound" global setting until manually configured.
      </span>)
    },
    {
      id: "notifications-notificationsound",
      title: "Notification Sound",
      indentLevel: 1,
      data: (<span>
        The notification sound is the SteamOS navigation sound played when sending an alarm notification. This setting will follow the "Notification Sound" global setting until manually configured.
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
      data: (()=>{
        let tableInfo = [
          ['batt%',       'Displays the battery percentage',                  `Battery level {batt%}%`],
          ['playHrs',     'Displays the daily/session hour playtime',         `You've been playing for {playHrs}h`],
          ['playMin',     'Displays the daily/session minute playtime',       `You've been playing for {playMin}m`],
          ['playSec',     'Displays the daily/session seconds playtime',      `You've been playing for {playSec}s`],
          ['thold',       'Displays the threshold value',                     `Warning {thold}%`],
          ['thold[:fmt]', 'Displays a formatted bedtime threshold date/time', `Bedtime at {thold:%I:%M}`],
          ['date:<fmt>',  'Displays a formatted current date/time',           `It's now {date:%I:%M}`]
        ]
        return (
          <table>
            <tr><td><b>Directive</b></td><td><b>Description</b></td><td><b>Example</b></td></tr>
            {tableInfo.map((info) => <tr><td>{info[0]}</td><td>{info[1]}</td><td>{info[2]}</td></tr>)}
          </table>
        )
      })()
    },
    {
      id: "dateformat",
      title: "Date Format",
      sectionTitle: true,
      data: <span style={{fontSize: "1.2em"}}>Date Format</span>
    },
    {
      indentLevel: 1,
      data: (()=>{
        let tableInfo = [
          ['%a',  'Weekday, short version',                                       'Wed'],
          ['%A',  'Weekday, full version',                                        'Wednesday'],
          ['%w',  'Weekday as a number 0-6, 0 is Sunday',                         '3'],
          ['%d',  'Day of month 01-31',                                           '08'],
          ['%-d', 'Day of month 1-31',                                            '8'],
          ['%b',  'Month name, short version',                                    'Jun'],
          ['%B',  'Month name, full version',                                     'June'],
          ['%m',  'Month as a number 01-12',                                      '06'],
          ['%-m', 'Month as a number 1-12',                                       '6'],
          ['%y',  'Year, without century as a number 01-99',                      '09'],
          ['%-y', 'Year, without century as a number 1-99',                       '9'],
          ['%Y',  'Year, full version',                                           '2009'],
          ['%H',  'Hour 00-23',                                                   '02'],
          ['%-H', 'Hour 0-23',                                                    '2'],
          ['%I',  'Hour 00-12',                                                   '05'],
          ['%-I', 'Hour 0-12',                                                    '5'],
          ['%p',  'AM/PM',                                                        'PM'],
          ['%M',  'Minute 00-59',                                                 '04'],
          ['%-M', 'Minute 0-59',                                                  '4'],
          ['%S',  'Second 00-59',                                                 '08'],
          ['%-S', 'Second 0-59',                                                  '8'],
          //['%f',  'Microsecond 000000-999999',                                    '548513'],
          //['%z',  'UTC offset',                                                   '+0100'],
          //['%Z',  'Timezone',                                                     'CST'],
          //['%j',  'Day number of year 001-366',                                   '070'],
          //['%-j',  'Day number of year 1-366',                                    '70'],
          //['%U',  'Week number of year, Sunday as the first day of week, 00-53',  '52'],
          //['%W',  'Week number of year, Monday as the first day of week, 00-53',  '52'],
          ['%c',  'Local version of date and time',                               '8/13/2023, 8:03:23 PM'],
          //['%C',  'Century',                                                      '20'],
          ['%x',  'Local version of date',                                        '8/13/2023'],
          ['%X',  'Local version of time',                                        '8:03:23 PM'],
          ['%%',  'A literal "%" character',                                      '%'],
          //['%G',  'ISO 8601 year',                                                '2018'],
          //['%u',  'ISO 8601 weekday (1-7)',                                       '1'],
          //['%V',  'ISO 8601 weeknumber (01-53)',                                  '01']
        ]
        return (
          <table>
            <tr><td><b>Directive</b></td><td><b>Description</b></td><td><b>Example</b></td></tr>
            {tableInfo.map((info) => <tr><td>{info[0]}</td><td>{info[1]}</td><td>{info[2]}</td></tr>)}
          </table>
        )
      })()
    },
    {
      id: "bottom",
      sectionTitle: true,
      data: ""
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