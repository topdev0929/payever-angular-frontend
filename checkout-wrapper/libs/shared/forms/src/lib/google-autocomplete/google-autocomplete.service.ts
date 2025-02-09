import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { API_URL } from './config.constant';

@Injectable({
  providedIn: 'root',
})
export class GoogleAutocompleteService {
  private loaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Inject(LOCALE_ID) private localeId: string,
    private http: HttpClient,
  ) { }


  loadScript$ = this.loaded$.pipe(
    switchMap(loaded => loaded ? of(loaded) : this.loadScript()),
  );

  private loadScript() {
    const url = `${API_URL}&key=${this.env.config.googleMapsApiKey}&language=${this.localeId}`;

    return this.http.jsonp(url, 'callback').pipe(
      tap(() => this.loaded$.next(true)),
      catchError(() => {
        this.loaded$.next(false);

        return of(false);
      })
    );
  }
}
