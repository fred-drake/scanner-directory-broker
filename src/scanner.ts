import express from 'express';
import cors from 'cors';
import { spawn, exec, ExecException } from 'child_process';
import * as log from './log';
import { getConfig } from './config';

// const execSync = util.promisify(exec);
const app = express();
const logTopic = 'scanner';
app.use(cors());

let isRunning = false;
app.get('/scan', (_, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  log.info('Initiating scan...', logTopic);
  const child = spawn('epsonscan2', ['-s', 'ES-400', '../UserSettings.SF2']);
  isRunning = true;
  setResponseStatus(res);

  child.on('exit', (code, signal) => {
    isRunning = false;
    log.info(
      `child process existed with code ${code} and signal ${signal}`,
      logTopic,
    );
  });
});

app.get('/status', (_, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  setResponseStatus(res);
});

const scannerWebPort = getConfig().scannerWebPort;
app.listen(scannerWebPort, () => {
  log.info(`Server listening on port ${scannerWebPort}.`, logTopic);
});

const setResponseStatus = async (res: express.Response): Promise<void> => {
  return new Promise<void>((resolve, reject): void => {
    exec(
      'epsonscan2 --list | grep "device ID" | wc -l | tr -d "\n"',
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
          reject(error);
          return;
        }

        if (stderr) {
          res.json({
            running: isRunning,
            error: stderr,
          });
          resolve();
          return;
        }

        res.json({
          running: isRunning,
          deviceAvailable: parseInt(stdout, 10) > 0,
        });
      },
    );
  });
};
