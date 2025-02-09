import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PlatformHeaderService } from '../services';

@Injectable()
export class NotEmptyPlatformHeaderGuard implements CanActivate {

  constructor(private platformHeaderService: PlatformHeaderService) {}

  canActivate(): Observable<boolean> {
    if (this.platformHeaderService.platformHeaderSubject$.value) {
      return of(true);
    } else {
      return this.platformHeaderService.platformHeader$.pipe(
        filter(data => !!data),
        map(() => true)
      );
    }
  }

}
