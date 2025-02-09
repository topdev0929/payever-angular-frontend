import { changeInnerHtml } from '../common/index';

export const setFontFamily = (fontName: string): void => {
  document.getElementById('device-main-wrapper')!.style.fontFamily = fontName;
  changeInnerHtml('font-label', fontName);
}