import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';

@Injectable()
export class SandboxEnv extends EnvService {
  get businessId(): string {
    // return 'c193b0d1-c229-4e4d-9587-1c37233d2ee7';
    return '2382ffce-5620-4f13-885d-3c069f9dd9b4';
    // return '4d78c462-a60b-4fa3-833a-164ce524c65b';
    // return '90bc401b-33aa-47b2-8621-f68de780a824';
  }

  get businessData(): any {
    return {
      themeSettings: {
        theme: 'default',
      },
    };
  }

  businessData$: Observable<any>;
  businessId$: Observable<string>;
}
