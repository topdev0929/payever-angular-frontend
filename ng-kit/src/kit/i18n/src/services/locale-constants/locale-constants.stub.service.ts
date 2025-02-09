import { Injectable, Provider } from '@angular/core';

import { LocaleConstantsService } from './locale-constants.service';

@Injectable()
export class LocaleConstantsStubService extends LocaleConstantsService {

  constructor() {
    super({});
  }

  static provide(): Provider {
    return {
      provide: LocaleConstantsService,
      useClass: LocaleConstantsStubService
    };
  }

}
