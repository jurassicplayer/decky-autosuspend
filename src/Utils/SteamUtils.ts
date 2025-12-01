import { findModuleChild, Module, ToastData } from "decky-frontend-lib";
import { BackendCtx } from "./Backend"
import { defaultSettings } from "./Settings"
import { Logger } from "./Logger"
import { CSSProperties } from "react";

const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m) {
      try {
        if (m[prop][property]) {
          return m[prop];
        }
      } catch (e) {
        return undefined;
      }
    }
  });
}

const SleepParent = findModule("InitiateSleep")
export const NavSoundMap = findModule("ToastMisc")
export const downloadsStore = findModule("m_DownloadOverview")
export const SleepManager = findModule("RegisterForNotifyResumeFromSuspend")

export class SteamUtils {
  static async suspend() {
    await Logger.debug('Sending suspend request to SteamOS')
    SleepParent.OnSuspendRequest()
  }
  static async shutdown() {
    await Logger.debug('Sending shutdown request to SteamOS')
    SteamClient.System.ShutdownPC()
  }

  static registerForOnSuspend(callback: (_: unknown) => void): { unregister: () => void } {
    const register = SteamClient.System.RegisterForOnSuspendRequest?.bind(SteamClient.System) ?? SleepManager?.RegisterForNotifyRequestSuspend;
    
    //Probably log here or something in case they change it again
    if (!register) return { unregister: () => { } };
    return register(callback);
  }
  static registerForOnResumeFromSuspend(callback: (_: unknown) => void): { unregister: () => void } {
    const register = SteamClient.System.RegisterForOnResumeFromSuspend?.bind(SteamClient.System) ?? SleepManager?.RegisterForNotifyResumeFromSuspend;
    if (!register) return { unregister: () => { } };

    //Probably log here or something in case they change it again
    return register(callback);
  }


  //#region Notification Wrapper
  static async notify(title: string, message: string, showToast?: boolean, playSound?: boolean, sound?: string, duration?: number) {
    let sfx = sound ? NavSoundMap[sound] : NavSoundMap[defaultSettings.defaultSound]
    if (playSound === undefined ) playSound = defaultSettings.defaultPlaySound
    if (showToast === undefined ) showToast = defaultSettings.defaultShowToast
    let toastData: ToastData = {
      title: title,
      body: message,
      duration: duration,
      sound: sfx,
      playSound: playSound,
      showToast: showToast
    }
    BackendCtx.serverAPI.toaster.toast(toastData)
  }
  //#endregion
}

export const SteamCssVariables = {
    basicuiHeaderHeight            : "var(--basicui-header-height, 0px)"
  , stickyHeaderBackgroundOpacity  : "var(--sticky-header-background-opacity, 0)"
  , gamepadPageContentMaxWidth     : "var(--gamepad-page-content-max-width, 1100px)"
  , scrollFadeSize                 : "var(--scroll-fade-size, 20px)"

  , virtualmenuAccent                    : "var(--virtualmenu-accent,          #1a9fff)"
  , virtualmenuBg                        : "var(--virtualmenu-bg,              #1f1f1f)"
  , virtualmenuBgHover                   : "var(--virtualmenu-bg-hover,        #103753)"
  , virtualmenuFg                        : "var(--virtualmenu-fg,              #ffffff)"
  , virtualmenutouchkeyIconWidth         : "var(--virtualmenutouchkey-icon-width, 100%)"
  , virtualmenutouchkeyIconHeight        : "var(--virtualmenutouchkey-icon-height, 100%)"
  , virtualmenupointerX                  : "var(--virtualmenupointer-x, 0%)"
  , virtualmenupointerY                  : "var(--virtualmenupointer-y, 0%)"
  , virtualmenupointerColor              : "var(--virtualmenupointer-color,    #1a9fff)"
  , virtualmenutouchkeyMidpointX         : "var(--virtualmenutouchkey-midpoint-x, 0%)"
  , virtualmenutouchkeyMidpointY         : "var(--virtualmenutouchkey-midpoint-y, 0%)"
  , virtualmenutouchkeyDescriptionWidth  : "var(--virtualmenutouchkey-description-width, 0px)"

  , touchmenuiconFg    : "var(--touchmenuicon-fg,                              #b8bcbf)"
  , touchmenuiconBg    : "var(--touchmenuicon-bg,                              #1f1f1f)"
  , touchmenuiconScale : "var(--touchmenuicon-scale, 1)"

  , indentLevel                    : "var(--indent-level, 0)"
  , fieldNegativeHorizontalMargin  : "var(--field-negative-horizontal-margin, 0px)"
  , fieldRowChildrenSpacing        : "var(--field-row-children-spacing, 0px)"

  , mainTextColor                : "var(--main-text-color,                     #dbe2e6)"
  , mainLightBlueBackground      : "var(--main-light-blue-background,          #93b3c8)"
  , mainTextOnLightBlue          : "var(--main-text-on-light-blue,             #d1d1d1)"
  , mainTopImageBg               : "var(--main-top-image-bg,                   #1f2126)"
  , mainEditorBgColor            : "var(--main-editor-bg-color,                #363a43)"
  , mainEditorTextColor          : "var(--main-editor-text-color,              #e6e7e8)"
  , mainEditorInputBgColor       : "var(--main-editor-input-bg-color,          #30333b)"
  , mainEditorSectionTitleColor  : "var(--main-editor-section-title-color,     #a3a3a3)"

  , gpSystemLightestGrey           : "var(--gpSystemLightestGrey,              #DCDEDF)"
  , gpSystemLighterGrey            : "var(--gpSystemLighterGrey,               #B8BCBF)"
  , gpSystemLightGrey              : "var(--gpSystemLightGrey,                 #8B929A)"
  , gpSystemGrey                   : "var(--gpSystemGrey,                      #67707B)"
  , gpSystemDarkGrey               : "var(--gpSystemDarkGrey,                  #3D4450)"
  , gpSystemDarkerGrey             : "var(--gpSystemDarkerGrey,                #23262E)"
  , gpSystemDarkestGrey            : "var(--gpSystemDarkestGrey,               #0E141B)"
  , gpStoreLightestGrey            : "var(--gpStoreLightestGrey,               #CCD8E3)"
  , gpStoreLighterGrey             : "var(--gpStoreLighterGrey,                #A7BACC)"
  , gpStoreLightGrey               : "var(--gpStoreLightGrey,                  #7C8EA3)"
  , gpStoreGrey                    : "var(--gpStoreGrey,                       #4e697d)"
  , gpStoreDarkGrey                : "var(--gpStoreDarkGrey,                   #2A475E)"
  , gpStoreDarkerGrey              : "var(--gpStoreDarkerGrey,                 #1B2838)"
  , gpStoreDarkestGrey             : "var(--gpStoreDarkestGrey,                #000F18)"
  , gpGradientStoreBackground      : "var(--gpGradient-StoreBackground,    linear-gradient(180deg, var(--gpStoreDarkGrey,#2A475E) 0%, var(--gpStoreDarkerGrey,#1B2838) 80%))"
  , gpGradientLibraryBackground    : "var(--gpGradient-LibraryBackground,  radial-gradient(farthest-corner at 40px 40px, var(--gpSystemDarkGrey, #3D4450) 0%, var(--gpSystemDarkerGrey, #23262E) 80%))"
  , gpColorBlue                    : "var(--gpColor-Blue,                      #1A9FFF)"
  , gpColorBlueHi                  : "var(--gpColor-BlueHi,                    #00BBFF)"
  , gpColorGreen                   : "var(--gpColor-Green,                     #5ba32b)"
  , gpColorGreenHi                 : "var(--gpColor-GreenHi,                   #59BF40)"
  , gpColorOrange                  : "var(--gpColor-Orange,                    #E35E1C)"
  , gpColorRed                     : "var(--gpColor-Red,                       #D94126)"
  , gpColorRedHi                   : "var(--gpColor-RedHi,                     #EE563B)"
  , gpColorDustyBlue               : "var(--gpColor-DustyBlue,                 #417a9b)"
  , gpColorLightBlue               : "var(--gpColor-LightBlue,                 #B3DFFF)"
  , gpColorYellow                  : "var(--gpColor-Yellow,                    #FFC82C)"
  , gpColorChalkyBlue              : "var(--gpColor-ChalkyBlue,                #66C0F4)"
  , gpBackgroundLightSofter        : "var(--gpBackground-LightSofter,          #6998bb24)"
  , gpBackgroundLightSoft          : "var(--gpBackground-LightSoft,            #3b5a7280)"
  , gpBackgroundLightMedium        : "var(--gpBackground-LightMedium,          #678BA670)"
  , gpBackgroundLightHard          : "var(--gpBackground-LightHard,            #93B8D480)"
  , gpBackgroundLightHarder        : "var(--gpBackground-LightHarder,          #aacce6a6)"
  , gpBackgroundDarkSofter         : "var(--gpBackground-DarkSofter,           #0e141b33)"
  , gpBackgroundDarkSoft           : "var(--gpBackground-DarkSoft,             #0e141b66)"
  , gpBackgroundDarkMedium         : "var(--gpBackground-DarkMedium,           #0e141b99)"
  , gpBackgroundDarkHard           : "var(--gpBackground-DarkHard,             #0e141bcc)"
  , gpBackgroundNeutralLightSofter : "var(--gpBackground-Neutral-LightSofter,  #ebf6ff1a)"
  , gpBackgroundNeutralLightSoft   : "var(--gpBackground-Neutral-LightSoft,    #ebf6ff33)"
  , gpBackgroundNeutralLightMedium : "var(--gpBackground-Neutral-LightMedium,  #ebf6ff4d)"
  , gpBackgroundNeutralLightHard   : "var(--gpBackground-Neutral-LightHard,    #ebf6ff66)"
  , gpBackgroundNeutralLightHarder : "var(--gpBackground-Neutral-LightHarder,  #ebf6ff80)"
  , gpCornerSmall                  : "var(--gpCorner-Small, 1px)"
  , gpCornerMedium                 : "var(--gpCorner-Medium, 2px)"
  , gpCornerLarge                  : "var(--gpCorner-Large, 3px)"
  , gpSpaceGutter                  : "var(--gpSpace-Gutter, 24px)"
  , gpSpaceGap                     : "var(--gpSpace-Gap, 12px)"
  , gpNavWidth                     : "var(--gpNavWidth, 240px)"
  , gpPaymentsNavWidth             : "var(--gpPaymentsNavWidth, 340px)"
  , gpDselectWidth                 : "var(--gpDselectWidth, 340px)"
  , gpSidePanelWidth               : "var(--gpSidePanelWidth, 340px)"
  , gpGiftingPanelWidth            : "var(--gpGiftingPanelWidth, 280px)"
  , gpCommunityRightPanelWidth     : "var(--gpCommunityRightPanelWidth, 320px)"
  , gpVerticalResponsivePaddingSmall   : "var(--gpVerticalResponsivePadding-Small,   calc( (100vw - 854px) / 60 ))"
  , gpVerticalResponsivePaddingMedium  : "var(--gpVerticalResponsivePadding-Medium,  calc( (100vw - 854px) / 20 ))"
  , gpVerticalResponsivePaddingLarge   : "var(--gpVerticalResponsivePadding-Large,   calc( (100vw - 854px) / 12 ))"
  , gpScreenWidth        : "var(--screen-width, 100vw)"
  , gpWidth6colcap       : "var(--gpWidth-6colcap, calc((var(--screen-width, 100vw) - (5 * var(--gpSpace-Gap, 12px)) - (2 * var(--gpSpace-Gutter, 24px))) / 6))"
  , gpWidth5colcap       : "var(--gpWidth-5colcap, calc((var(--screen-width, 100vw) - (4 * var(--gpSpace-Gap, 12px)) - (2 * var(--gpSpace-Gutter, 24px))) / 5))"
  , gpWidth4colcap       : "var(--gpWidth-4colcap, calc((var(--screen-width, 100vw) - (3 * var(--gpSpace-Gap, 12px)) - (2 * var(--gpSpace-Gutter, 24px))) / 4))"
  , gpWidth3colcap       : "var(--gpWidth-3colcap, calc((var(--screen-width, 100vw) - (2 * var(--gpSpace-Gap, 12px)) - (2 * var(--gpSpace-Gutter, 24px))) / 3))"
  , gpWidth2colcap       : "var(--gpWidth-2colcap, calc((var(--screen-width, 100vw) - (1 * var(--gpSpace-Gap, 12px)) - (2 * var(--gpSpace-Gutter, 24px))) / 2))"
  , gpWidth1colcap       : "var(--gpWidth-1colcap, calc((var(--screen-width, 100vw) - (2 * var(--gpSpace-Gutter, 24px)))))"
  , gpStoreMenuHeight    : "var(--gpStoreMenuHeight, 58px)"
  , gpShadowSmall        : "var(--gpShadow-Small,  0px 2px 2px 0px #0000003D)"
  , gpShadowMedium       : "var(--gpShadow-Medium, 0px 3px 6px 0px #0000003D)"
  , gpShadowLarge        : "var(--gpShadow-Large,  0px 12px 16px 0px #0000003D)"
  , gpShadowXLarge       : "var(--gpShadow-XLarge, 0px 24px 32px 0px #0000003D)"
  , gpTextHeadingLarge   : "var(--gpText-HeadingLarge)"   // normal 700 26px/1.4 "Motiva Sans", Arial, Sans-serif
  , gpTextHeadingMedium  : "var(--gpText-HeadingMedium)"  // normal 700 22px/1.4 "Motiva Sans", Arial, Sans-serif
  , gpTextHeadingSmall   : "var(--gpText-HeadingSmall)"   // normal 700 18px/1.4 "Motiva Sans", Arial, Sans-serif
  , gpTextBodyLarge      : "var(--gpText-BodyLarge)"      // normal 400 16px/1.4 "Motiva Sans", Arial, Sans-serif
  , gpTextBodyMedium     : "var(--gpText-BodyMedium)"     // normal 400 14px/1.4 "Motiva Sans", Arial, Sans-serif
  , gpTextBodySmall      : "var(--gpText-BodySmall)"      // normal 400 12px/1.4 "Motiva Sans", Arial, Sans-serif

  // Custom shared CSS
  , customTransparent    : "#fff0" // Transparent
  , customStatusGreen    : "#0b6f4c"
  , customStatusYellow   : "#9c8f40"
  , customStatusRed      : "#7a0a0a"
  , customSpinnerBgColor : "#0c1519"
}

export const SteamCss: {[key:string]: CSSProperties} = {
  BasicUI: {
    marginLeft: "3ex"
  },
  NotificationGroup: {
    borderBottom: `1px solid ${SteamCssVariables.gpSystemDarkerGrey}`,
    padding: "2px"
  },
  NotificationGroupExpanded: {
    borderBottom: "none",
    padding: "2px",
    marginBottom: "4px",
    backgroundColor: "rgba(59,63,72,.5)",
    borderRadius: SteamCssVariables.gpCornerMedium
  },
  NotificationSection: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  NotificationFeedToggle: {
    marginRight: "5px",
    display: "flex"
  },
  NotificationDescription: {
    flex: 5,
    color: SteamCssVariables.gpSystemLightestGrey
  },
  PrefDetailsToggle: {
    transition: "transform .2s ease-in-out",
    height: "18px",
    marginTop: "4px"
  },
  PrefDetailsSelected: {
    transform: "rotateZ(180deg)"
  },
  NotificationPrefDetails : {
    display: "flex",
    flexDirection: "column",
    backgroundColor: SteamCssVariables.gpSystemDarkerGrey,
    padding: "1ex 0 0 5ex",
    boxShadow: "inset 0px 2px 3px rgba(0,0,0,.5)",
    flexWrap: "wrap"
  }
}

export const CustomCss: {[key: string]: CSSProperties } = {
  Description: {
    fontSize: "0.8em",
    marginLeft: "0.8em"
  }
}

export interface Unregisterable {
  unregister(): void
}