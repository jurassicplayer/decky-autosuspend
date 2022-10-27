#!/usr/bin/env python3
import logging
logging.basicConfig(filename="/tmp/decky-autosuspend.log",
                    format='[AutoSuspend] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues


import subprocess, re, os
def parse_value(report, field):
    regex_result = re.search(f'{field}:[^a-zA-Z0-9]+([a-zA-Z0-9.% ]+)', str(report))
    if regex_result:
        return regex_result.groups()[0]
    return "N/A"

def battery_report():
    report = subprocess.check_output(["upower", "-i", "/org/freedesktop/UPower/devices/battery_BAT1"])
    return {
        "model": parse_value(report, "model"),
        "percentage": float(parse_value(report, "percentage").strip('%')),
        "capacity": parse_value(report, "capacity"),
        "warningLevel": parse_value(report, "warning-level"),
        "state": parse_value(report, "state"),
        "energy": parse_value(report, "energy"),
        "energyEmpty": parse_value(report, "energy-empty"),
        "energyFull": parse_value(report, "energy-full"),
        "energyFullDesign": parse_value(report, "energy-full-design"),
        "energyRate": parse_value(report, "energy-rate"),
        "timeToEmpty": parse_value(report, "time to empty"),
        "timeToFull": parse_value(report, "time to full"),
        "voltage": parse_value(report, "voltage"),
    }

class Plugin:
    async def log(self, msg):
        logger.info('{}'.format(msg))

    async def get_value(self, key):
        report = battery_report()
        return report[key]
    
    async def suspend(self):
        #os.system("/home/deck/.steam/root/ubuntu12_32/steam -ifrunning steam://shortpowerpress")
        os.system("systemctl suspend")