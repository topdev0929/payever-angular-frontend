import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable({
  providedIn: 'root',
})
export class ShareBagApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
  ) {}

  downloadQrCode(
    code: string,
    type: string,
  ): Observable<any> {
    const params = new HttpParams().appendAll({
      url: code,
      type,
    });

    return this.http.get<string>(
      `${this.env.connect.qr}/api/download/${type}`,
      { params, responseType: 'blob' as any },
    );
  }
}
