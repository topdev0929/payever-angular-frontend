import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { PeAffiliatesApi } from './abstract.affiliates.api';

@Injectable()
export class PeActualAffiliatesApi implements PeAffiliatesApi {
  private programs$ = new BehaviorSubject<any[]>([
    {
      title: 'Program 1',
      subtitle: 'Bananas Inc. affiliate program',
      assets: '234',
      affiliates: '9879',
      budget: '$ 79/mo',
      id: '1',
    },
    {
      title: 'Program 2',
      subtitle: 'Bananas Inc. affiliate program',
      assets: '234',
      affiliates: '9879',
      budget: '$ 79/mo',
      id: '2',
    },
    {
      title: 'Program 3',
      subtitle: 'Bananas Inc. affiliate program',
      assets: '234',
      affiliates: '9879',
      budget: '$ 79/mo',
      id: '3',
    },
    {
      title: 'Program 4',
      subtitle: 'Bananas Inc. affiliate program',
      assets: '234',
      affiliates: '9879',
      budget: '$ 79/mo',
      id: '4',
    },
    {
      title: 'Program 5',
      subtitle: 'Bananas Inc. affiliate program',
      assets: '234',
      affiliates: '9879',
      budget: '$ 79/mo',
      id: '5',
    },
  ]);
  constructor(private http: HttpClient) {}

  getPrograms(): Observable<any[]> {
    return this.programs$.asObservable();
  }

  deletePrograms(programIds: string[]): void {
    const currentPrograms = this.programs$.value;
    this.programs$.next(currentPrograms.filter(cmp => !programIds.includes(cmp.id)));
  }
}
