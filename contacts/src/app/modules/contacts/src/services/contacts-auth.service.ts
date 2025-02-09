import { Injectable } from '@angular/core';

import { PeContactsAuthService } from '.';

@Injectable()
export class ContactsAuthService extends PeContactsAuthService {
  isAdmin(): boolean {
    return false;
  }
}
