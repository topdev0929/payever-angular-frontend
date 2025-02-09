import { BrowserInfoInterface } from '../models';

export function getBrowserInfo(): BrowserInfoInterface {

  return {
    javascriptEnabled: true,
    cookiesEnabled: navigator.cookieEnabled,
    screenColorDepth: window.screen.colorDepth,
    screenHeight: window.screen.height,
    screenWidth: window.screen.width,
    timeZone: new Date().getTimezoneOffset(),
    language: navigator.language.split('-')[0].toUpperCase(),
  };
}
