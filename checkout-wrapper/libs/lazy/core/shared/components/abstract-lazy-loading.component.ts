import { Injector, Directive, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, filter, mapTo, takeUntil, tap } from 'rxjs/operators';

import { CustomElementService } from '@pe/checkout/utils';

import { AbstractFlowIdComponent } from './abstract-flow-id.component';

@Directive()
export abstract class AbstractLazyLoadingComponent extends AbstractFlowIdComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  isLoading$: Observable<boolean>;
  isLocalesReady$: Observable<void>;
  isAllReady$: Observable<void>;

  protected isLoadingSubject = new BehaviorSubject<boolean>(false);
  protected isLocalesReadySubject = new BehaviorSubject<boolean>(false);

  protected icons: string[] = [];

  protected customElementService = this.injector.get(CustomElementService);

  constructor(injector: Injector) {
    super(injector);

    this.isLoading$ = this.isLoadingSubject.asObservable();
    this.isLocalesReady$ = this.isLocalesReadySubject.pipe(
      filter(d => !!d),
      mapTo(null),
    );
    /**
     * @deprecated
     * Left for compatibility
     */
    this.isAllReady$ = this.isLocalesReady$;
  }

  ngOnInit(): void {
    super.ngOnInit();

    const payeverStatic = (window as any).PayeverStatic;
    if (payeverStatic && this.icons?.length) {
      payeverStatic.IconLoader.loadIcons(this.icons, null, this.customElementService.shadowRoot);
    }
    payeverStatic?.SvgIconsLoader?.loadIcons(
      ['info-16'],
      null,
      this.customElementService.shadowRoot
    ); // For Norway Micro

    this.isLoading$.pipe(
      delay(1),
      tap(() => this.cdr.detectChanges()),
      takeUntil(this.destroy$),
    ).subscribe();

    this.isLocalesReadySubject.next(true);

    this.loadLazyModuleAndComponent();
  }

  protected abstract loadLazyModuleAndComponent(): void;
}
