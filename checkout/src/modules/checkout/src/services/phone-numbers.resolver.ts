import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { ApiService, EnvService, StorageService } from '../services';

@Injectable()
export class PhoneNumbersResolver implements Resolve<string[]> {

  constructor(private apiService: ApiService,
              private envService: EnvService,
              private storageService: StorageService) {
  }

  resolve(): Observable<string[]> {
    return this.storageService.fetchPhoneNumbers();
  }
}
