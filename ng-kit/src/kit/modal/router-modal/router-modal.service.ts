import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import { uniqueId } from 'lodash-es';

interface RouterModalConfig {
  displaySubmit?: boolean;
  submitText?: string;
  displayCancel?: boolean;
  cancelText?: string;
  displayCloseIcon?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  displayAdditional?: boolean;
  additionalText?: string;
  dialogClasses?: string;
  id?: string;
  newModeActivate?: boolean;
}

const DefaultRouterModalConfig = {
  displaySubmit: true,
  submitText: 'Submit',
  displayCancel: true,
  cancelText: 'Cancel',
  displayCloseIcon: false,
  closeOnBackdrop: false,
  closeOnEsc: false,
  displayAdditional: false,
  additionalText: 'Additional Button',
  dialogClasses: 'col-sm-8 col-xs-12',
  id: uniqueId('modal_')
};

@Injectable()
class RouterModalService {

  // from components to popup
  private configSubject = new Subject<RouterModalConfig>();
  private closeSubject = new Subject<boolean>();

  // from popup to components
  private submitSubject = new Subject<boolean>();
  private cancelSubject = new Subject<boolean>();
  private additionalSubject = new Subject<boolean>();

  /**
   * Push configuration action.
   *
   * @param config
   */
  config(config: RouterModalConfig): void {
    this.configSubject.next(config);
  }

  /**
   * Push close action.
   */
  close(): void {
    this.closeSubject.next(true);
  }

  /**
   * Push submit event.
   */
  submit(): void {
    this.submitSubject.next(true);
  }

  /**
   * Push cancel event.
   */
  cancel(): void {
    this.cancelSubject.next(true);
  }

  /**
   * Push additional event.
   */
  additional(): void {
    this.additionalSubject.next(true);
  }

  /**
   * Close action observable.
   *
   * @returns {Observable<boolean>}
   */
  get close$(): Observable<boolean> {
    return this.closeSubject.asObservable();
  }

  /**
   * Configuration action observable.
   *
   * @returns {Observable<RouterModalConfig>}
   */
  get config$(): Observable<RouterModalConfig> {
    return this.configSubject.asObservable();
  }

  /**
   * Modal submit event observable.
   *
   * @returns {Observable<boolean>}
   */
  get submit$(): Observable<boolean> {
    return this.submitSubject.asObservable();
  }

  /**
   * Modal cancel event observable.
   *
   * @returns {Observable<boolean>}
   */
  get cancel$(): Observable<boolean> {
    return this.cancelSubject.asObservable();
  }

  /**
   * Modal additional event observable.
   *
   * @returns {Observable<boolean>}
   */
  get additional$(): Observable<boolean> {
    return this.additionalSubject.asObservable();
  }
}

export { DefaultRouterModalConfig, RouterModalConfig, RouterModalService };
