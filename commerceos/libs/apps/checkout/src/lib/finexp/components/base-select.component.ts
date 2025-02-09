import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Directive, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Directive()
export abstract class BaseSelectComponent {

  isOpened$ = new BehaviorSubject<boolean>(false);

  protected cdr = this.injector.get(ChangeDetectorRef);

  constructor(
    protected injector: Injector,
  ) {
  }

  openDropdown(): void {
    this.isOpened$.next(true);
  }

  closeDropdown(): void {
    this.isOpened$.next(false);
  }

  getOverlayWidth(
    overlayOrigin: CdkOverlayOrigin,
  ): string | number {
    return overlayOrigin.elementRef.nativeElement.getBoundingClientRect().width;
  }
}
