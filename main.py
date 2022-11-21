#!/usr/bin/env python
import logging
logging.basicConfig(filename="/tmp/autosuspend.log",
                    format='[AutoSuspend] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

# Initialize decky-loader settings manager
from settings import SettingsManager
from helpers import get_home_path, get_homebrew_path, get_user

import os
logger.info('Settings path: {}{}settings'.format(get_homebrew_path(get_home_path(get_user())), os.sep))
settings = SettingsManager(name="autosuspend", settings_directory='{}{}settings'.format(get_homebrew_path(get_home_path(get_user())), os.sep))
settings.read()

class Plugin:
  async def settings_read(self):
    logger.info('Reading settings')
    return settings.read()
  async def settings_commit(self):
    logger.info('Saving settings')
    return settings.commit()
  async def settings_getSetting(self, key: str, defaults):
    logger.info('Get {}'.format(key))
    return settings.getSetting(key, defaults)
  async def settings_setSetting(self, key: str, value):
    logger.info('Set {}: {}'.format(key, value))
    return settings.setSetting(key, value)
