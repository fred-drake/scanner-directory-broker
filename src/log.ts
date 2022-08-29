/*
 * Logging routines.
 */

import { getConfig } from './config';
import 'colorts/lib/string';

const config = getConfig();

// Sends a trace-level log message, if trace debugging is enabled.
export function trace(message: string, topic = ''): void {
  if (!config.trace) return;
  log('trace', message, topic);
}

// Sends a debug-level log message, if debug messaging is enabled.
export function debug(message: string, topic = ''): void {
  if (!config.debug) return;
  log('debug', message, topic);
}

// Sends an info-level log message.
export function info(message: string, topic = ''): void {
  log('info', message, topic);
}

// Sends a warn-level log message.
export function warn(message: string, topic = ''): void {
  log('warn', message, topic);
}

// Sends an error-level log message.
export function error(message: string, topic = ''): void {
  log('error', message, topic);
}

// Common function for sending the log message
function log(level: string, message: string, topic: string): void {
  const date = new Date();
  const dateString = date.toLocaleString('en-US', {
    weekday: 'short', // long, short, narrow
    day: '2-digit', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'short', // numeric, 2-digit, long, short, narrow
    hour: '2-digit', // numeric, 2-digit
    minute: '2-digit', // numeric, 2-digit
    second: '2-digit', // numeric, 2-digit
  });
  const format = `${dateString} - ${level
    .toUpperCase()
    .padEnd(5)} - (${topic.padEnd(36)}) - ${message}`;
  switch (level) {
    case 'trace': {
      console.log(format.gray);
      break;
    }
    case 'debug': {
      console.log(format.gray);
      break;
    }
    case 'info': {
      console.log(format.green);
      break;
    }
    case 'warn': {
      console.log(format.yellow);
      break;
    }
    case 'error': {
      console.log(format.red);
      break;
    }
    default: {
      console.log(format);
      break;
    }
  }
}
