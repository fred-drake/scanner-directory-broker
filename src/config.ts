import YAML from 'yaml';
import fs from 'fs';

// Definition for the configuration
export interface Configuration {
  debug: boolean;
  trace: boolean;
  paperlessApiUrl: string;
  paperlessUsername: string;
  paperlessPassword: string;
  scannerWebPort: number;
  watchDirectoryPath: string;
  outgoingDirectoryPath: string;
}

// Get the configuration object from file, overriding with environment variables
export function getConfig(): Configuration {
  const file = fs.readFileSync('config.yaml', 'utf-8');
  const config: Configuration = YAML.parse(file);

  if (process.env.TRACE) {
    config.trace = true;
  }

  if (process.env.DEBUG) {
    config.debug = true;
  }

  return config;
}
