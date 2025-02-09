import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { PeAdsApi } from './abstract.ads.api';

@Injectable()
export class PeActualAdsApi implements PeAdsApi {
  private campaigns$ = new BehaviorSubject<any[]>([
    {
      title: 'Campaign C',
      subtitle: 'N/A',
      labels: ['DRAFT'],
      image: '/assets/themes/list/preview_1.jpg',
      id: '1',
    },
    {
      title: 'Campaign A',
      subtitle: '28 342$ total earned',
      description: 'Create your own messages.',
      labels: ['1338 SALES'],
      image: '/assets/themes/list/preview_2.jpg',
      id: '2',
    },
    {
      title: 'Campaign D',
      subtitle: '2 003$ total earned',
      description: 'Not bad for a start.',
      labels: ['297 SALES'],
      image: '/assets/themes/list/preview_3.jpg',
      id: '3',
    },
    {
      title: 'Campaign B',
      subtitle: 'N/A',
      labels: ['DRAFT'],
      image: '/assets/themes/list/preview_2.jpg',
      id: '4',
    },
    {
      title: 'Campaign E',
      subtitle: '1$ total earned',
      description: 'Way to go.',
      labels: ['1 SALE'],
      image: '/assets/themes/list/preview_3.jpg',
      id: '5',
    },
  ]);
  constructor(private http: HttpClient) {}

  getCampaigns(): Observable<any[]> {
    return this.campaigns$.asObservable();
  }

  deleteCampaigns(campaignIds: string[]): void {
    const currentCampaigns = this.campaigns$.value;
    this.campaigns$.next(currentCampaigns.filter(cmp => !campaignIds.includes(cmp.id)));
  }
}
