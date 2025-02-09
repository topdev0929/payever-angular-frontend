import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

@Injectable()
export class SendToDeviceService {

  constructor(private http: HttpClient, @Inject(PE_ENV) protected env: EnvironmentConfigInterface) {
  }

  sendToDevice(
    flowId: string,
    email: string,
    phoneFrom: string,
    phoneTo: string,
    subject: string,
    message: string,
  ): Observable<object> {
    const data = {
      message,
      subject: subject || '---',
    } as any;
    if (phoneTo) {
      data.phoneFrom = phoneFrom;
      data.phoneTo = phoneTo;
    }
    if (email) {
      data.email = email;
    }

    // TODO: Move all urls to config
    return this.http.post(
      `${this.env.backend.checkout}/api/flow/v1/${flowId}/send-to-device`,
      data
    );
  }
}
