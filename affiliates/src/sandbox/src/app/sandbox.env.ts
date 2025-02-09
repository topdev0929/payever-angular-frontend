import { Injectable } from '@angular/core';
import { PebEnvService } from '@pe/common';

@Injectable()
export class SandboxEnv implements PebEnvService {
  constructor() {}

  get businessId(): string {
    return '8634a199-47eb-41e8-99d7-9cda857f9323';
  }

  get businessData(): any {
    return {
      themeSettings: {
        theme: 'default',
      },
    };
  }
}
