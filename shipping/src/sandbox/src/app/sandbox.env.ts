import { Injectable } from '@angular/core';
import { EnvService } from '@pe/common';

@Injectable()
export class SandboxEnv implements EnvService {
  constructor() {}

  get businessId(): string {
    return 'a74aafe4-81a0-4c3f-b139-0ab792854e41';
  }

  get businessData(): any {
    return {
      themeSettings: {
        theme: 'default',
      },
    };
  }
}
