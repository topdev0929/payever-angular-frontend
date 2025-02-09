import { Injectable } from '@angular/core';

import { PeMessageIntegrationThemeItemValues, PeMessageService } from '@pe/message/shared';
import { PeChatMessage, PeMessageColors } from '@pe/shared/chat';

// tslint:disable:no-bitwise
@Injectable()
export class PeMessageThemeService {
  colors: PeMessageColors = {
    message: ['', ''],
    bgChat: '',
    accent: '',
    app: '',
    blurValue: '',
  };

  constructor(private peMessageService: PeMessageService) { }

  setColors(settings: PeMessageIntegrationThemeItemValues) {
    const isBlurValueEmpty = !settings?.messageWidgetBlurValue;

    this.colors = {
      bgChat: isBlurValueEmpty ? settings?.bgChatColor || '' : 'transparent',
      accent: isBlurValueEmpty ? settings?.accentColor || '' : '#fff',
      app: isBlurValueEmpty ? settings?.messageAppColor || '' : 'transparent',
      message: !isBlurValueEmpty ? ['transparent', 'transparent'] :
        [settings?.messagesBottomColor || '', settings?.messagesTopColor || ''],
      blurValue: settings?.messageWidgetBlurValue,
    };
  }

  public setMessageTheme(message: PeChatMessage, theme?: string) {
    const colorIndex = message.reply ? 1 : 0;

    return {
      ...message,
      theme: this.peMessageService.isLiveChat
        ? this.setTheme(this.colors.message[colorIndex])
        : theme,
    };
  }

  messageAccentColor(message: PeChatMessage): string {
    const amt = this.setTheme(this.colors.message[0]) === 'dark' ? 135 : -135;

    return message.reply
      ? this.colors.accent
      : this.adjustBrightness(this.colors.message[0], amt);
  }

  setTheme(color: string): string {
    const rgbArr = this.hexToRGBArr(color);
    const newColor = rgbArr[0] > 80 && rgbArr[1] > 80 && rgbArr[2] > 80 ? 'light' : 'dark';

    return newColor;
  }

  hexToRGBArr(color: string): number[] {
    const colorForParse = color.substr(1, 6);
    const rgb = colorForParse.match(/.{2}/g) || ['00', '00', '00'];
    const r = parseInt(rgb[0], 16);
    const g = parseInt(rgb[1], 16);
    const b = parseInt(rgb[2], 16);

    return [r, g, b];
  }

  adjustBrightness(col: string, amt: number): string {
    let usePound = false;

    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }

    let R = parseInt(col.substring(0, 2), 16);
    let G = parseInt(col.substring(2, 4), 16);
    let B = parseInt(col.substring(4, 6), 16);

    R = Math.max(0, Math.min(255, R + amt));
    G = Math.max(0, Math.min(255, G + amt));
    B = Math.max(0, Math.min(255, B + amt));

    let RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
    let GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
    let BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

    return (usePound ? "#" : "") + RR + GG + BB;
  }
}
