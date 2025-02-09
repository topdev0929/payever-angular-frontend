import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { FieldsGQLService } from '../fields-gql.service';
import { IMockData, MOCK_DATA } from './mock-injection-tokens';
import { Field } from '../../interfaces';

import { Apollo } from 'apollo-angular';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockFieldsGqlService extends FieldsGQLService {

  constructor(
    apollo: Apollo,
    envService: EnvService,
    @Inject(MOCK_DATA) mockData: IMockData,
  ) {
    super(apollo, envService, mockData);
  }

  getDefaultField(): Observable<Field[]> {
    return of([...this.mockData.fields]).pipe(
      delay(Math.random() * 1000),
      map(fields => fields.filter(f => !f.businessId)),
      tap(fields => console.log('getDefaultFields', fields)),
    );
  }

  getAllFields(): Observable<Field[]> {
    return this.getFields();
  }

  getFields(): Observable<Field[]> {
    return of([...this.mockData.fields]).pipe(
      delay(Math.random() * 1000),
      // map(fields => fields.filter(f => f.businessId === this.envService.businessId)),
      tap(fields => console.log('getFields')),
    );
  }

  createCustomField(field: Field): Observable<Field> {
    const mockField = {
      ...field,
      id: uuidv4(),
      businessId: this.envService.businessId,
    };
    return of(null).pipe(
      delay(Math.random() * 1000),
      tap(() => this.mockData.fields.push(mockField)),
      map(() => mockField),
    );
  }

  updateCustomField(field: Field): Observable<Field> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        let newField: Field = field;
        this.mockData.fields.some((f, i) => {
          const result = field.id === f.id;
          if (result) {
            newField = {
              ...f,
              ...field,
            };
            this.mockData.fields[i] = newField;
          }
          return result;
        });
        return newField;
      }),
    );
  }

  deleteField(id: string): Observable<boolean> {
    return of({ id }).pipe(
      delay(Math.random() * 1000),
      tap(() => this.mockData.fields = this.mockData.fields.filter(f => f.id !== id)),
      map(() => true),
    );
  }
}
