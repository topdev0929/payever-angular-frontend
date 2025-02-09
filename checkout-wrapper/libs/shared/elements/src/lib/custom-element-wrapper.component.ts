import {
  AfterViewInit,
  Injector,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ElementRef,
  Directive,
} from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, timer } from 'rxjs';
import { takeUntil, map, take, tap } from 'rxjs/operators';

import { CustomElementService, LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';
import { PeDestroyService } from '@pe/destroy';

import { BaseCustomElementWrapperComponent } from './base-custom-element-wrapper.component';

@Directive()
export abstract class CustomElementWrapperComponent extends BaseCustomElementWrapperComponent implements AfterViewInit {

  @Output('ready') ready$: EventEmitter<boolean> = new EventEmitter();
  isReady$: Observable<boolean>;
  isReadyConfigLocales$: Observable<boolean>;

  protected customIsReadySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  protected customElementService = this._injector.get(CustomElementService);

  // '_' is to avoid name conflicts in inherited classes
  private _isReadySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _isIconsLoaded = false;

  private _env: EnvironmentConfigInterface = this._injector.get(PE_ENV);
  private _localeConstantsService: LocaleConstantsService = this._injector.get(LocaleConstantsService);
  private _cdr: ChangeDetectorRef = null;
  private _elementRef: ElementRef = this._injector.get(ElementRef);
  protected destroy$ = this._injector.get(PeDestroyService);

  constructor(protected _injector: Injector) {
    super(_injector);
    this.isReady$ = combineLatest([
      this._isReadySubject.asObservable(),
      this.customIsReadySubject,
    ]).pipe(
      map(d => d[0] && d[1])
    );
    this.isReadyConfigLocales$ = this._isReadySubject.asObservable();
    this.isReady$.pipe(takeUntil(this.destroy$)).subscribe(isReady => this.ready$.next(isReady));
  }

  ngAfterViewInit(): void {
    this.customElementService.elementRef = this._elementRef;
    this.destroy$.pipe(
      take(1),
      tap(() => {
        this.customElementService.elementRef = null;
      })
    ).subscribe();

    // timer here is to avoid ExpressionChangedAfterItHasBeenCheckedError
    timer(1).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadCustomElementConfigAndIcons();
      // We init here to not trigger detect changes before view initialed.
      this._cdr = this._injector.get(ChangeDetectorRef);
    });
  }

  updateCustomElementView(): void {
    if (this._cdr && !(this._cdr as any).destroyed) {
      this._cdr.detectChanges();
    }
  }

  /* @deprecated Use (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([...]); */
  protected abstract getIconsPack(): string[];

  protected isCustomElementReady(): boolean {
    // for children usage
    return true;
  }

  protected onCustomElementReady(): void {
    // for children usage
  }

  protected getLang(): string {
    return this._localeConstantsService.getLang();
  }

  protected triggerCustomElementReadyCheck(): void {
    if (this.isCustomElementReady()) {
      this.onCustomElementReady();
      this._isReadySubject.next(true);
    }
  }

  protected loadCustomElementConfigAndIcons(): void {
    if (!this._isIconsLoaded) {
      this.loadIconsPack(this._env.custom.cdn);
      this._isIconsLoaded = true;
    }
    this.triggerCustomElementReadyCheck();
  }

  private shadowRoot(): HTMLElement {
    return this._elementRef?.nativeElement?.shadowRoot ?
      this._elementRef.nativeElement.shadowRoot : null;
  }

  private loadIconsPack(cdnBase: string): void {
    const payeverStatic: any = (window as any).PayeverStatic;
    if (payeverStatic) {
      if (this.shadowRoot()) {
        // For ViewEncapsulation.ShadowDom case
        payeverStatic.IconLoader.loadIcons(this.getIconsPack(), null, this.shadowRoot());
      } else {
        payeverStatic.IconLoader.loadIcons(this.getIconsPack());
      }
    }
  }
}
