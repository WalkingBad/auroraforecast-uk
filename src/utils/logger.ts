/**
 * Centralized logging utility for web-seo platform
 * Automatically filters logs based on environment (dev vs production)
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (development only)
   * In production, these logs are suppressed
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always shown, even in production)
   * Use for critical errors that need to be tracked
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (development only)
   * In production, warnings are suppressed
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug messages (development only)
   * Use for verbose debugging information
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log informational messages (always shown)
   * Use sparingly for important user-facing information
   */
  info: (...args: any[]) => {
    console.info(...args);
  },
};
