import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { imitateHttp } from './imitate-http.decorator';

const emitFakeErrors = Boolean(localStorage.getItem('PEB_EMIT_FAKE_ERRORS'));

function getMockApiHttpError(url: string): HttpErrorResponse | null {
  if (Math.random() < 0.1) {
    if (Math.random() < 0.3) {
      /** Multiple error types if you need to handle errors differently depending on the status code */
      return new HttpErrorResponse({
        url,
        error: '500 Internal Server Error',
        statusText: '500 Internal Server Error',
        status: 500,
      });
    }
    if (Math.random() > 0.7) {
      return new HttpErrorResponse({
        url,
        error: '502 Bad Gateway',
        statusText: '502 Bad Gateway',
        status: 502,
      });
    }
    return new HttpErrorResponse({
      url,
      error: '504 Gateway Timeout Error',
      statusText: '504 Gateway Timeout Error',
      status: 504,
    });
  }

  return null;
}

/**
 * Api Mock class using IndexedDB as storage.
 *
 * To emulate http errors and snapshots hash inconsistency set local storage variable PEB_EMIT_FAKE_ERRORS to true.
 *
 * @see {@link getMockApiHttpError} if you need to adjust the probability of http errors or add more error types.
 */
@Injectable({ providedIn: 'root' })
export class SandboxMockBackend /* implements PeAffiliatesApi */ {

  @imitateHttp
  getCampaigns() {
    return of([
      {
        title: 'Campaign A',
        subtitle: 'N/A',
        labels: ['DRAFT'],
        image: '/assets/themes/list/preview_1.jpg',
        id: '1',
      },
      {
        title: 'Campaign B',
        subtitle: '28 342$ total earned',
        description: 'Create your own messages.',
        labels: ['1338 SALES'],
        image: '/assets/themes/list/preview_2.jpg',
        id: '2',
      },
      {
        title: 'Campaign C',
        subtitle: '2 003$ total earned',
        description: 'Not bad for a start.',
        labels: ['297 SALES'],
        image: '/assets/themes/list/preview_3.jpg',
        id: '3',
      },
      {
        title: 'Campaign D',
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
  }
}
