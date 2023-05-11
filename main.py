#!/usr/bin/env python
import logging, os
from settings import SettingsManager # type: ignore

# Setup environment variables
deckyHomeDir = os.environ["DECKY_HOME"]
settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
loggingDir = os.environ["DECKY_PLUGIN_LOG_DIR"]

# Setup backend logger
logging.basicConfig(filename=os.path.join(loggingDir, 'backend.log'),
                    format='[AutoSuspend] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

logger.info('Settings path: {}'.format(settingsDir))
settings = SettingsManager(name="settings", settings_directory=settingsDir)
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
