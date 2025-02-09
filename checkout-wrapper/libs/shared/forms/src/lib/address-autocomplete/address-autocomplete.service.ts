import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { AddressDetails, AddressItem } from './models';

@Injectable()
export class AddressAutocompleteService {
  private _items$ = new BehaviorSubject<AddressItem[]>([]);
  public readonly addressItems$ = this._items$;

  private sessionId: string;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
  ) {
    this.generateSessionId();
  }

  public resetItems(): void {
    this._items$.next([]);
  }

  public search(searchValue: string): Observable<AddressItem[]> {
    const url = `${this.env.backend.checkout}/api/flow/v1/address/search?q=${searchValue}&sessionId=${this.sessionId}`;

    if (!searchValue.trim()) {
      this._items$.next([]);

      return of([]);
    }

    return this.http.get<AddressItem[]>(url).pipe(
      tap(resp => this._items$.next(resp)),
      catchError(() => of([]))
    );
  }

  public details(placeId: string): Observable<AddressDetails> {
    const url = `${this.env.backend.checkout}/api/flow/v1/address/details/${placeId}?sessionId=${this.sessionId}`;

    return this.http.get<AddressDetails>(url).pipe(
      tap(() => this.generateSessionId())
    );
  }

  private generateSessionId(): void {
    this.sessionId = Date.now().toString();
  }
}
