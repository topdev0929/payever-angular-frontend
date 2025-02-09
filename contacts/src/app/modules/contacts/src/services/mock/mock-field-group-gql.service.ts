import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { FieldGroupGqlService } from '../field-group-gql.service';
import { IMockData, MOCK_DATA } from './mock-injection-tokens';
import { FieldGroup } from '../../interfaces';
import { PeContactsAuthService } from '..';

import { Apollo } from 'apollo-angular';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockFieldGroupGqlService extends FieldGroupGqlService {

  constructor(
    apollo: Apollo,
    envService: EnvService,
    authService: PeContactsAuthService,
    @Inject(MOCK_DATA) mockData: IMockData,
  ) {
    super(apollo, envService, authService, mockData);
  }

  getFieldGroups(): Observable<FieldGroup[]> {
    return of(this.mockData.fieldGroups).pipe(
      delay(300),
      tap(data => console.log('getFieldGroups', data)),
    );
  }

  getFieldGroupById(id: string): Observable<FieldGroup> {
    const fieldGroup = this.mockData.fieldGroups.find(fg => fg.id === id);
    return of(fieldGroup).pipe(
      delay(Math.random() * 1000),
    );
  }

  createFieldGroup(group: Partial<FieldGroup>): Observable<FieldGroup> {
    const element = {
      id: uuidv4(),
      ...group,
      businessId: this.envService.businessId,
    } as FieldGroup;
    return of(element).pipe(
      delay(Math.random() * 1000),
      tap(() => this.mockData.fieldGroups.push(element)),
    );
  }

}
