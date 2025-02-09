import {
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { first, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { BaseCustomElementWrapperComponent } from '@pe/checkout/elements';
import { CheckoutEventInterface } from '@pe/checkout/plugins';
import { CheckoutStateParamsInterface, FlowInterface, TimestampEvent } from '@pe/checkout/types';

@Directive()
export abstract class BaseCheckoutWrapperComponent extends BaseCustomElementWrapperComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  updateSteps$ = new EventEmitter<void>();
  @Input('updatesteps') set setUpdateSteps(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.updateSteps$.next(this.parseInputEventEmit(value));
    }
  }

  openOrderStep$ = new EventEmitter<void>();
  @Input('openorderstep') set setOpenOrderStep(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.openOrderStep$.next(this.parseInputEventEmit(value));
    }
  }

  updateFlow$ = new EventEmitter<void>();
  @Input('updateflow') set setUpdateFlow(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.updateFlow$.next(this.parseInputEventEmit(value));
    }
  }

  updateSettings$ = new BehaviorSubject<TimestampEvent>(null);
  @Input('updatesettings') set setUpdateSettings(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.updateSettings$.next(this.parseInputEventEmit(value));
    }
  }

  saveFlowToStorage$ = new EventEmitter<string>();
  @Input('saveflowtostorage') set setSaveFlowToStorage(value: any) {
    if (this.checkInputEventEmit(value)) {
      const { paymentLinkId } = this.parseInputByType<{ paymentLinkId: string }>(value);
      this.saveFlowToStorage$.next(paymentLinkId);
    }
  }

  disableLocaleDetection$ = new BehaviorSubject<boolean>(false);
  @Input('disablelocaledetection') set setDisableLocaleDetection(value: any) {
    this.disableLocaleDetection$.next(this.parseInputBoolean(value));
  }

  params$ = new BehaviorSubject<CheckoutStateParamsInterface>({});
  @Input('params') set setParams(value: any) {
    this.params$.next(this.parseInputObject(value));
    if (Object.keys(value).length !== 0) {
      (window as any).peCheckoutParams = value;
    }
  }

  fixedPosition$ = new BehaviorSubject<boolean>(false);
  @Input('fixedposition') set setFixedPosition(value: any) {
    this.fixedPosition$.next(this.parseInputBoolean(value));
  }

  checkoutHidden$ = new BehaviorSubject<boolean>(false);
  @Input('checkouthidden') set setCheckoutHidden(value: any) {
    this.checkoutHidden$.next(this.parseInputBoolean(value));
  }

  @Output('eventemitted') eventEmitted: EventEmitter<CheckoutEventInterface> = new EventEmitter();
  @Output('flowcloned') flowCloned: EventEmitter<{ cloned: FlowInterface }> = new EventEmitter();
  @Output('layoutshown') layoutShown: EventEmitter<void> = new EventEmitter();

  ngOnInit(): void {
    this.init(this.containerRef, this.customInit).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected abstract customInit(instance: unknown): Observable<unknown>;
  protected abstract loadComponent(containerRef: ViewContainerRef): Observable<any>;

  private init(
    containerRef: ViewContainerRef,
    customInit: (instance: any) => Observable<unknown>,
  ): Observable<unknown> {

    return this.loadComponent(containerRef).pipe(
      first(),
      mergeMap((component) => {
        const instance = component.instance;
        component.hostView.markForCheck();

        return this.initComponent(instance, customInit);
      }),
    );
  }

  private initProps(instance: any): Observable<unknown> {
    return merge(
      this.updateSteps$.pipe(tap(value => instance.setUpdateSteps = value)),
      this.openOrderStep$.pipe(tap(value => instance.setOpenOrderStep = value)),
      this.updateFlow$.pipe(tap(value => instance.setUpdateFlow = value)),
      this.updateSettings$.pipe(tap(value => instance.setUpdateSettings = value)),
      this.saveFlowToStorage$.pipe(tap(value => instance.setSaveFlowToStorage = value)),
      this.disableLocaleDetection$.pipe(tap(value => instance.setDisableLocaleDetection = value)),
      this.params$.pipe(tap(value => instance.setParams = value)),
      this.fixedPosition$.pipe(tap(value => instance.setFixedPosition = value)),
      this.checkoutHidden$.pipe(tap(value => instance.setCheckoutHidden = value)),
      instance.eventEmitted.pipe(tap((v: any) => this.eventEmitted.emit(v))),
      instance.flowCloned.pipe(tap((v: any) => this.flowCloned.emit(v))),
      instance.layoutShown.pipe(tap(() => this.layoutShown.emit())),
    );
  }

  private initComponent(
    instance: BaseCheckoutWrapperComponent,
    customInit: (instance: any) => Observable<unknown>,
  ): Observable<unknown> {
    return of(instance).pipe(
      mergeMap(() => merge(
        customInit(instance),
        this.initProps(instance),
      )),
      takeUntil(this.destroy$),
    );
  }
}
