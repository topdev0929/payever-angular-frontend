import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, merge } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';


@Injectable()
export class PebViewBaseHandler implements OnDestroy {
  destroy$ = new Subject<void>();

  startObserving(...observables: Observable<any>[]) {
    merge(...observables).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
