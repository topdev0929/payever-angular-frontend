import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { isDevMode } from '@angular/core';

import { WindowEventsService } from '../../../window';
import { MicroMessage } from '../types';

@Injectable()
export class MessageBusService {

  constructor(private windowEventsService: WindowEventsService) {
  }

  send(wnd: Window, channel: string, event: string, data: any = null, allowAllOrigins: boolean = false): void {
    let message: string = `pe:os:${channel}:${event}`;
    let dataText: string;

    if (data) {
      if (typeof data !== 'string') {
        dataText = JSON.stringify(data);
      } else {
        dataText = data;
      }

      message += `:${dataText}`;
    }

    wnd.postMessage(message, allowAllOrigins ? '*' : window.location.origin);
  }

  observe(channel: string = null, event: string = null): Observable<MicroMessage> {
    return this.windowEventsService.message$().pipe(
      map((event: any) => this.parseMessage(event)),
      filter((message: MicroMessage) => !!message),
      filter((message: MicroMessage) => !channel || channel === message.channel),
      filter((message: MicroMessage) => !event || event === message.event)
    );
  }

  private parseMessage(windowEvent: any): MicroMessage {
    const regex: RegExp = /^pe:os:(\w*):(\w*)(:(.*))?$/;

    if (typeof windowEvent.data !== 'string') {
      if (isDevMode()) {
        console.warn(`window event skipped because event data type does not match 'string'`, windowEvent.data);
      }
      return;
    }

    const match: string[] = regex.exec(windowEvent.data);
    if (!Array.isArray(match) || !match[1] || !match[2]) {
      if (isDevMode()) {
        console.warn(`window event skipped because of wrong format`, windowEvent.data);
      }
      return null;
    }

    const channel: string = match[1];
    const event: string = match[2];
    const dataRaw: string = match[4];
    let data: any;

    if (dataRaw) {
      try {
        data = JSON.parse(dataRaw);
      } catch (e) {
        data = dataRaw;
      }
    }

    return {channel, event, data};
  }
}
