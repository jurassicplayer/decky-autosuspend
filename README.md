## Decky-AutoSuspend Plugin
A plugin to notify and automatically suspend your steamdeck console when passing a battery percentage threshold.
![Main View](./assets/thumbnail.jpg)

## Overview
This plugin provides audible and toast notifications when reaching a warning and critical battery level. The warning and critical thresholds are user-defined and the audible notification can be turned off if a silent auto-suspend is preferred.

## Installation
1. [Install decky-loader](https://github.com/SteamDeckHomebrew/decky-loader#installation)
2. Use the built in plugin store to download the AutoSuspend plugin (WIP)

## Notes
- Toasts do not appear in-game. There is nothing I can do about this at the current time (it's just not something decky-loader can do atm)
- The plugin relies on `upower` for battery information, which updates roughly every 2min.
- The warning threshold slider is disabled if below the currently selected critical threshold
- The `Apply Settings` button is specifically for the warning/critical sliders (to prevent suddenly suspending the console while changing settings)
- The audible notification toggle is instantly applied.
- The plugin calls `systemctl suspend`, and is NOT the same suspend as when you hit the power button which means:
   - No suspend animation when triggered
   - Requires root
   - May or may not play nicely with other applications/plugins due to suspend method (in particular the `pause games` plugin maybe? Can't really tell)
- I basically don't know ReactJS, so if there is a glaring flaw feel free to create an issue, PR, or w/e.

## Assets Used:
- Included (aka hard-coded) into the plugin is a base64 encoded `Low Battery Sound` by Spanac from FreeSoundsLibrary.com
   - Modified to remove silent sections and repeated once.
   - License is included in the repository as `LICENSE.low-battery-sound.md` if it wasn't obvious