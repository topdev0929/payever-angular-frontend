import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import QRCode from 'qrcode';

import { DataUrlQROptions, QROptions } from '../interfaces';

@Injectable()
export class QRService {
  public generateDataURLImg(text: string, options?: DataUrlQROptions): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      QRCode.toDataURL(text, options, (error, url) => {
        if (error) {
          observer.error(error);
        }
        observer.next(url);
        observer.complete();
      });
    });
  }

  public writeToCanvas(canvas: HTMLElement, text: string, options?: QROptions): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      QRCode.toCanvas(canvas, text, options, error => {
        if (error) {
          observer.error(error);
        }
        observer.complete();
      });
    });
  }
}
