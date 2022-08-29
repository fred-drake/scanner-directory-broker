import fs from 'fs';
import mv from 'mv';
import * as log from './log';
import { getConfig } from './config';
import request from 'request';

const sleep = function(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
};

const moveFile = function(src: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mv(src, dest, error => {
      if (!error) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
};

const sendRequest = (
  url: string,
  options: request.CoreOptions | undefined,
): Promise<request.Response> => {
  return new Promise((resolve, reject) => {
    request(url, options, (error, res): void => {
      if (!error) {
        resolve(res);
      } else {
        reject(error);
      }
    });
  });
};

const main = async (): Promise<void> => {
  const logTopic = 'broker:main';
  log.info('Scanning watch directory every few seconds.');
  for (;;) {
    const files = await fs.promises.readdir(getConfig().watchDirectoryPath);
    for (const file of files) {
      log.info(`Found file to process: ${file}`, logTopic);
      const now = new Date().toJSON().replace(/:/g, '');
      const documentTitle = `scan-${now}`;
      log.info(`Pushing to paperless as document ${documentTitle}`);

      const url = `${getConfig().paperlessApiUrl}/documents/post_document/`;
      const authCreds = Buffer.from(
        `${getConfig().paperlessUsername}:${getConfig().paperlessPassword}`,
      ).toString('base64');

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authCreds}`,
          'Content-Type': 'multipart/form-data',
        },
        formData: {
          title: documentTitle,
          document: fs.createReadStream(
            `${getConfig().watchDirectoryPath}/${file}`,
          ),
        },
      };

      log.debug(`url: ${url}`, logTopic);
      try {
        const res = await sendRequest(url, options);
        log.info(
          `Response from Paperless API: (${res.statusCode}) ${res.statusMessage}`,
        );
      } catch (error) {
        log.error(`Couldn't send request to Paperless API: ${error}`);
      }

      try {
        await moveFile(
          `${getConfig().watchDirectoryPath}/${file}`,
          `${getConfig().outgoingDirectoryPath}/${documentTitle}.pdf`,
        );
        log.info(
          `Moved file ${file} to outgoing directory as ${documentTitle}.pdf`,
          logTopic,
        );
      } catch (err) {
        log.error(`Couldn't move file: ${err}`, logTopic);
      }
    }

    await sleep(2000);
  }
};

main()
  .then()
  .catch(e => console.error(`Fatal problem! ${e}`));
