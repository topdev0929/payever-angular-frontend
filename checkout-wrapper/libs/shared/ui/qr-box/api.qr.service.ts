import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';

import { PE_ENV } from '@pe/common';

@Injectable()
export class ApiQrService {

  protected http = this.injector.get(HttpClient);
  protected env = this.injector.get(PE_ENV);

  constructor(private injector: Injector) {}

  downloadQrCode(
    url: string,
    type = 'png',
  ): Observable<any> {
    const params = new HttpParams().appendAll({ url, type });

    return this.http.get<string>(
      `${this.env.connect.qr}/api/download/${type}`,
      { params, responseType: 'blob' as any },
    );
  }
}
