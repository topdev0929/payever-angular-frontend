import { Directive, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Directive()
export abstract class AbstractComponentDirective implements OnDestroy {
  protected destroyed$ = new ReplaySubject<boolean>();

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
