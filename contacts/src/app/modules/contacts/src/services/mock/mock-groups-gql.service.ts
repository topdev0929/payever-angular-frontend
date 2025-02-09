import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { ITEMS_PER_PAGE } from '../../constants';
import { IMockData, MOCK_DATA } from './mock-injection-tokens';
import { Group, OrderQuery } from '../../interfaces';
import { GroupsGQLService } from '../groups-gql.service';
import { PeContactsAuthService } from '..';

import { Apollo } from 'apollo-angular';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockGroupsGQLService extends GroupsGQLService {

  public page: number = 0;
  protected itemCount: number = ITEMS_PER_PAGE;
  public hasNextPage: boolean = true;

  constructor(
    apollo: Apollo,
    envService: EnvService,
    authService: PeContactsAuthService,
    @Inject(MOCK_DATA) private mockData: IMockData,
  ) {
    super(apollo, envService, authService);
  }

  getGroups(
    filters: { [name: string] : { values: any[], type: string }[] } = {},
    orderBy: OrderQuery[] = [],
  ): Observable<{result: Group[], totalCount: number}> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        const filterValue = (dataValue, key): boolean => {
          if (dataValue && filters[key].length) {
            return filters[key].every((filter: any) => {
              switch (filter.type) {
                case '==':
                  return filter.values[0] === dataValue;
                case '!=':
                  return filter.values[0] !== dataValue;
                case '>':
                  return filter.values[0] < dataValue;
                case '<':
                  return filter.values[0] > dataValue;
                case '><':
                  return filter.values[0] < dataValue && filter.values[1] > dataValue;
                case '^':
                  return new RegExp(`^${filter.values[0]}`, 'i').test(dataValue);
                case '$':
                  return new RegExp(`${filter.values[0]}$`, 'i').test(dataValue);
                case '%':
                  return new RegExp(filter.values[0], 'i').test(dataValue);
                case '!%':
                  return !new RegExp(filter.values[0], 'i').test(dataValue);
                default:
                  return false;
              }
            });
          }
          return false;
        };
        const data = this.mockData.groups.filter((group: any) => {
          return Object.keys(filters).every((key: any) => {
            return filterValue(group[key], key);
          });
        });
        const offset = this.page * this.itemCount;
        const result = data.slice(offset, this.itemCount);
        return { result, totalCount: data.length };
      }),
    );
  }

  getGroupById(id: string): Observable<Group> {
    return of(null).pipe(
      map(() => {
        const result = this.mockData.groups.find(g => g.id === id);
        return { ...result };
      })
    );
  }

  createGroup(group: Partial<Group>): Observable<Group> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        const element = {
          ...group,
          id: uuidv4(),
        } as Group;
        this.mockData.groups.push(element);
        console.log('createGroup', element);
        return { ...element };
      }),
    );
  }

  updateGroup(group: Group): Observable<Group> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        const index = this.mockData.groups.findIndex(g => g.id === group.id);
        if (index < 0) {
          throw new Error('no group with id');
        }
        const element = { ...group };
        this.mockData.groups[index] = element;
        return { ...element };
      }),
    );
  }

  deleteGroup(id: string): Observable<any> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        this.mockData.groups = this.mockData.groups.filter(g => g.id !== id);
        return true;
      })
    );
  }

}
