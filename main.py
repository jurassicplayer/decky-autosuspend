#!/usr/bin/env python3
import logging
logging.basicConfig(filename="/tmp/decky-autosuspend.log",
                    format='[AutoSuspend] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues



import asyncio
class Plugin:
    async def suspend(self):
        logger.info("Calling suspend")
        # Fails with steam giving an exit code of -11 (no idea what it means)
        out = await self.run('/home/deck/.steam/root/ubuntu12_32/steam steam://shortpowerpress')
        logger.info("{}".format(out))
    
    async def run(command):
        proc = await asyncio.create_subprocess_shell(command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE)

        stdout, stderr = await proc.communicate()
        if (proc.returncode != 0):
            logger.info(f"Process exited with error code {proc.returncode}")
            logger.info(stderr.decode())

        return stdout.decode()