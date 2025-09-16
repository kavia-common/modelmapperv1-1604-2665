// Centralized logging service with environment-aware behavior

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
const bypassAuth = String(process.env.REACT_APP_BYPASS_AUTH).toLowerCase() === 'true';

class Logger {
  constructor() {
    this.api = null;
  }

  setApi(api) {
    this.api = api;
  }

  _shouldLog(level) {
    return level >= currentLevel;
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = bypassAuth ? '[MOCK] ' : '';
    return {
      timestamp,
      level: Object.keys(LOG_LEVELS)[level],
      message: `${prefix}${message}`,
      data
    };
  }

  async _sendToBackend(logEntry) {
    if (this.api && process.env.NODE_ENV === 'production') {
      try {
        await this.api.log(logEntry);
      } catch (e) {
        console.error('Failed to send log to backend:', e);
      }
    }
  }

  debug(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      const entry = this._formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.debug(entry.message, entry.data || '');
      this._sendToBackend(entry);
    }
  }

  info(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      const entry = this._formatMessage(LOG_LEVELS.INFO, message, data);
      console.info(entry.message, entry.data || '');
      this._sendToBackend(entry);
    }
  }

  warn(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      const entry = this._formatMessage(LOG_LEVELS.WARN, message, data);
      console.warn(entry.message, entry.data || '');
      this._sendToBackend(entry);
    }
  }

  error(message, error = null) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      const entry = this._formatMessage(LOG_LEVELS.ERROR, message, {
        error: error?.message || String(error),
        stack: error?.stack
      });
      console.error(entry.message, entry.data || '');
      this._sendToBackend(entry);
    }
  }
}

export const logger = new Logger();
