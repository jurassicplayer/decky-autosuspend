import { AnchorHTMLAttributes, CSSProperties, VFC, useEffect, useRef, useState } from "react"
import { useAppContext } from "../Utils/Context"
import { DialogBody, DialogControlsSection, DialogControlsSectionHeader, Field, Focusable } from "decky-frontend-lib"
import { SteamCssVariables } from "../Utils/SteamUtils"

interface element {
  uniqueID: string
  ref: React.RefObject<HTMLElement>
  element: JSX.Element
}

const ElementField = (props: any): element => {
  const ref = useRef<HTMLDivElement>(null)
  const element = <div {...props} ref={ref} />
  return {uniqueID: props.label, ref: ref, element: element}
}

export const AboutScrollPanel: CSSProperties = {
  height: "95%",
  minHeight: "95%",
  margin: "0px",
  borderRadius: SteamCssVariables.gpCornerLarge,
  //display: "flex",
  justifyContent: "center",
  backgroundColor: SteamCssVariables.gpBackgroundLightSofter
}
export const AboutContainer: CSSProperties = {
  margin: "20px 20px 0px 20px",
  paddingBottom: "15px",
  flexDirection: "column",
  minWidth: "95%",
  display: "flex"
}

const FocusBar = () => {
  return (
    // @ts-ignore
    <Focusable focusableIfNoChildren={true}/>
  )
}
const Anchor = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const anchor = useRef<HTMLAnchorElement>(null)
  return (
    // @ts-ignore
    <Focusable focusableIfNoChildren={true} onOKButton={()=>anchor.current?.click()}><a ref={anchor} {...props}/></Focusable>
  )
}
const TopColorBar = () => {
  const topColorBarCSS: CSSProperties = {
    width: "100%",
    height: "1px",
    background: "linear-gradient(to right, #00ccff, #3366ff)"
  }
  return (
    <div className="TopColorBar" style={topColorBarCSS}><Anchor href="#top"/></div>
  )
}

interface contents {
  element: any
  addToC?: string
  children?: contents[]
}

const Info: VFC = () => {
  const { appInfo } = useAppContext()
  const content: contents[] = [
    {
      element: "Alarm Types",
      addToC: "alarmTypes",
      children: [
        {
          element: "Discharge",
          addToC: "alarmTypes-discharge",
          children: [
            { element: "Discharge alarms are triggered when the battery level has discharged to the designated percentage threshold" }
          ]
        },
        { element: <TopColorBar /> },
        {
          element: "Overcharge",
          addToC: "alarmTypes-overcharge",
          children: [
            { element: "Overcharge alarms are triggered when the battery level has charged to the designated percentage threshold" }
          ]
        },
        { element: <TopColorBar /> },
        {
          element: "Bedtime",
          addToC: "alarmTypes-bedtime",
          children: [
            { element: "Bedtime alarms are triggered when the current time has reached a certain time of day" }
          ]
        },
        { element: <TopColorBar /> },
        {
          element: "Daily Playtime",
          addToC: "alarmTypes-dailyplaytime",
          children: [
            { element: "Daily playtime alarms are triggered when the console has been actively running until the designated time threshold, resets at midnight, and persists across suspends/reboots" }
          ]
        },
        { element: <TopColorBar /> },
        {
          element: "Session Playtime",
          addToC: "alarmTypes-sessionplaytime",
          children: [
            { element: "Session playtime alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold, and resets when suspended or rebooted" }
          ]
        },
        { element: <TopColorBar /> },
        {
          element: "Download Complete",
          addToC: "alarmTypes-downloadComplete",
          children: [
            { element: "Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted" }
          ]
        },
        { element: <TopColorBar /> }
      ]
    }
  ]
  const indentation = 6
  // generate table of contents from contents
  const generateEntry = (contentItem: contents, treeLevel: number) => {
    if (contentItem.addToC) {
      return <div id={contentItem.addToC}>{contentItem.element}<div style={{marginLeft: `${treeLevel*indentation}px`}}>{contentItem.children?.map(contentChildItem => generateEntry(contentChildItem, treeLevel+1))}</div></div>
    } else {
      return <div>{contentItem.element}<div style={{marginLeft: `${treeLevel*indentation}px`}}>{contentItem.children?.map(contentChildItem => generateEntry(contentChildItem, treeLevel+1))}</div></div>
    }
  }
  const generateToC = (contentItem: contents, treeLevel: number) => {
    if (!contentItem.addToC) { return }
    if (contentItem.children) {
      return <div><Anchor href={`#${contentItem.addToC}`}>{contentItem.element}</Anchor><div style={{marginLeft: `${treeLevel*indentation}px`}}>{contentItem.children?.map(contentChildItem => generateToC(contentChildItem, treeLevel+1))}</div></div>
    } else {
      return <div><Anchor href={`#${contentItem.addToC}`}>{contentItem.element}</Anchor></div>
    }
  }
  const GeneratedHTML = () => {
    let toc = content.map(contentItem => generateToC(contentItem, 1))
    return { tableOfContents: toc, contentHtml: content.map(contentItem => generateEntry(contentItem, 1))}
  }

  let {tableOfContents, contentHtml} = GeneratedHTML()
  const [elements, setElements] = useState<element[]>([])
  useEffect(()=>{
    let rawElement = <div><p>Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted</p>
    <p>Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted</p></div>
    setElements([ElementField(rawElement)])
    console.log(elements)
  },[])

  return (
    <DialogBody>
      <DialogControlsSection>
        <DialogControlsSectionHeader>Alarm Types</DialogControlsSectionHeader>
        <Field
          label="Discharge"
          description={
            <div>
              <p>Discharge alarms are triggered when the battery level has discharged to the designated percentage threshold</p>
            </div>
          }
          focusable={true} />
        <Field
          label="Overcharge"
          description={
            <div>
              <p>Overcharge alarms are triggered when the battery level has charged to the designated percentage threshold</p>
            </div>
          }
          focusable={true} />
        <Field
          label="Bedtime"
          description={
            <div>
              <p>Bedtime alarms are triggered when the current time has reached a certain time of day</p>
            </div>
          }
          focusable={true} />
        <Field
          label="Daily Playtime"
          description={
            <div>
              <p>Daily playtime alarms are triggered when the console has been actively running until the designated time threshold, resets at midnight, and persists across suspends/reboots</p>
            </div>
          }
          focusable={true} />
        <Field
          label="Session Playtime"
          description={
            <div>
              <p>Session playtime alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold, and resets when suspended or rebooted</p>
            </div>
          }
          focusable={true} />
        <Field
          label="Download Complete"
          description={
            <div>
              <p>Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted</p>
              <p>Download complete alarms are triggered when the accumulated time that the console has been actively running reaches the designated duration threshold after finishing a download queue, and resets when suspended or rebooted</p>
            </div>
          }
          focusable={true} />
        {/*elements.map(element=>element.element)*/}
      </DialogControlsSection>
    </DialogBody>
  )

  return (
    <div>
      <Anchor id="top"/>
      <Anchor href="#top">{appInfo.name} v{appInfo.version}</Anchor>
      <TopColorBar/>
      <div className="section">
        <div className="title">
          Table of Contents
        </div>
        <div className="content">
          {tableOfContents}
        </div>
      </div>
      <TopColorBar/>
      {contentHtml}
      <div className="section">
        <div className="title">
          Lorem Ipsem
        </div>
        <FocusBar/>
        <div id="content" className="content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam blandit ligula eget odio malesuada, nec rutrum magna accumsan. Phasellus in leo non mauris feugiat tincidunt. Maecenas varius tortor eget semper malesuada. Nulla ac arcu vitae tortor vehicula tempus in nec lectus. Duis eget sollicitudin lorem, vitae dictum turpis. Etiam sit amet dignissim justo. Morbi gravida ipsum ac nisl molestie placerat.

          Cras sit amet nisi in felis pulvinar porta. Nunc a diam a arcu tincidunt tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ipsum diam, venenatis nec mauris id, porttitor lobortis leo. Sed tempus vel neque eget commodo. Vestibulum mollis, eros mattis lacinia interdum, neque lorem laoreet massa, non lobortis magna magna porttitor justo. Nullam nec feugiat justo, et aliquam enim. Maecenas finibus vel elit id pretium.

          Praesent dictum elit eget molestie porttitor. Pellentesque id aliquet arcu. Phasellus accumsan lobortis ante at vestibulum. Aliquam eleifend sapien non augue pharetra tempus. Nulla quis interdum dui. Phasellus pharetra eleifend rhoncus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed tristique tellus id justo cursus viverra. Curabitur id ipsum orci. Phasellus sit amet ante augue. Nam tristique rhoncus varius. Curabitur at lacus at urna pellentesque lacinia. Sed rhoncus tortor gravida tortor dapibus, a cursus nisl vestibulum. Quisque tincidunt suscipit auctor. Sed libero lectus, congue eu leo ut, fringilla mattis ipsum.

          Donec et libero consequat, sollicitudin mauris vehicula, faucibus neque. Cras rhoncus sapien sit amet arcu commodo, vel pretium est congue. Vivamus nec ex auctor, posuere orci a, volutpat risus. Fusce sed posuere nunc. Curabitur porttitor fermentum urna. Donec aliquet, urna dapibus elementum rutrum, purus arcu venenatis velit, at accumsan nunc augue vitae ligula. Donec sit amet orci elementum, dictum dui in, tincidunt tortor. Integer ut dui quis quam convallis luctus. Suspendisse potenti. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a hendrerit enim. Donec finibus mauris at neque suscipit aliquet. Nunc ultrices odio diam, ac gravida enim sollicitudin at.

          Proin consectetur faucibus libero et auctor. Etiam dictum luctus dui, sed eleifend metus egestas a. Phasellus ut rhoncus mauris, sed faucibus nunc. Suspendisse suscipit felis luctus turpis semper, at volutpat justo posuere. Suspendisse rutrum, elit a tempor dapibus, nibh lectus imperdiet ante, vel iaculis tortor quam quis diam. Nulla a suscipit tellus, nec lacinia leo. Sed ullamcorper tellus dui, vel maximus felis tempor sed. Cras egestas feugiat est eu pulvinar. Nam sit amet dui in orci porta cursus. Donec mattis et libero eget faucibus. Nullam eu justo metus. Ut dignissim, nulla nec laoreet interdum, ipsum nibh luctus arcu, vel convallis lacus velit a nisi. Nullam ut fermentum lacus, vitae lacinia libero. Interdum et malesuada fames ac ante ipsum primis in faucibus. 
        </div>
        <FocusBar/>
      </div>
    </div>
  )
}

export default Info