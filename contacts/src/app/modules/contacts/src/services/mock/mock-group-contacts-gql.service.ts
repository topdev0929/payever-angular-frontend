import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { GroupContactsGQLService } from '../group-contacts-gql.service';
import { GroupContact } from '../../interfaces';
import { IMockData, MOCK_DATA } from './mock-injection-tokens';

import { Apollo } from 'apollo-angular';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockGroupContactsGqlService extends GroupContactsGQLService {

  constructor(
    apollo: Apollo,
    envService: EnvService,
    @Inject(MOCK_DATA) private mockData: IMockData,
  ) {
    super(apollo, envService);
  }

  createGroupContact(groupContact: GroupContact): Observable<GroupContact> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        const element = {
          ...groupContact,
          id: uuidv4(),
        };
        this.mockData.groupContacts.push(element);
        return { ...element };
      }),
    );
  }

  deleteGroupContact(id: string): Observable<any> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        this.mockData.groupContacts = this.mockData.groupContacts.filter(gc => gc.id !== id);
        console.log('deleteGroupContact', this.mockData.groupContacts);
        return;
      }),
    );
  }

}
