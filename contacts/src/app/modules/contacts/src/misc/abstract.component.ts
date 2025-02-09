import { Directive, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class AbstractComponent implements OnDestroy {

  protected destroyed$ = new ReplaySubject<boolean>();

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
