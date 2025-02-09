import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Event } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { merge, cloneDeep, values } from 'lodash-es';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { ModalButtonInterface, ModalButtonListInterface, ModalViewConfigInterface } from '../interfaces';
import { UI_MODAL_PRESETS } from './modal-presets';

type ModalViewConfigPresetName = 'small' | 'confirm' | 'notificationWarning' | 'large' | 'largeDefaultHeader' | 'largeBlueHeader' | 'docker';
type ModalButtonListPresetName = 'confirmCancel' | 'saveCancel' | 'cancel' | 'close';

@Component({
  selector: 'pe-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output('onClose') onClose: EventEmitter<Event> = new EventEmitter<Event>();
  @Input('doHide') doHide: Subject<boolean> = null;

  @Input('baseViewConfig') baseViewConfig: ModalViewConfigPresetName = 'small';
  @Input('baseButtons') baseButtons: ModalButtonListPresetName = 'close';
  @Input('showLoading') showLoading: boolean = false;
  @Input('disableHide') disableHide: boolean = false;
  @Input('grayBG') grayBG: boolean = false;

  @ViewChild('modal', { static: true }) public modal: ModalDirective;

  mergedButtons: ModalButtonListInterface = {};
  orderedButtons: ModalButtonInterface[] = [];
  mergedViewConfig: ModalViewConfigInterface = {};

  @Input('viewConfig') set viewConfig(value: ModalViewConfigInterface) {
    this.mergedViewConfig = this.getMergedViewConfig(value);
  }

  @Input('buttons') set buttons(value: ModalButtonListInterface) {
    this.mergedButtons = this.getMergedButtons(value);
    this.orderedButtons = this.getOrderedButtons(this.mergedButtons);
  }

  private onHideSub: Subscription;

  ngOnInit(): void {
    if (this.doHide) {
      this.doHide.subscribe((hide: boolean) => {
        if (hide) {
          this.hide();
        }
      });
    }
    this.viewConfig = this.mergedViewConfig;
    this.buttons = this.mergedButtons;
  }

  ngOnDestroy(): void {
    this.onHideSub.unsubscribe();
    if (this.doHide) {
      this.doHide.unsubscribe();
    }
    this.modal.hide();
  }

  ngAfterViewInit(): void {
    this.modal.show();
    this.onHideSub = this.modal.onHidden.subscribe(() => {
      this.onClose.emit();
    });
  }

  hide(): void {
    if (!this.disableHide) {
      this.modal.hide();
    } else {
      this.onClose.emit();
    }
  }

  private getMergedViewConfig(viewConfig: ModalViewConfigInterface): ModalViewConfigInterface {
    let result: ModalViewConfigInterface = {};
    if (this.baseViewConfig) {
      if (UI_MODAL_PRESETS.viewConfig[this.baseViewConfig] !== undefined) {
        result = cloneDeep(UI_MODAL_PRESETS.viewConfig[this.baseViewConfig]);
      } else {
        throw new Error('Invalid view preset for ModalComponent!');
      }
    }
    merge(result, viewConfig || {});
    return result;
  }

  private getMergedButtons(buttons: ModalButtonListInterface): ModalButtonListInterface {
    let result: ModalButtonListInterface = {};
    if (this.baseButtons) {
      if (UI_MODAL_PRESETS.buttons[this.baseButtons] !== undefined) {
        result = cloneDeep(UI_MODAL_PRESETS.buttons[this.baseButtons]);
      } else {
        throw new Error('Invalid button preset for ModalComponent!');
      }
    }
    merge(result, buttons || {});
    return result;
  }

  private isButtonDisabled(button: ModalButtonInterface): boolean {
    return this.showLoading || button.disabled;
  }

  private processButtonClick(button: ModalButtonInterface): void {
    if (button.click === 'close') {
      this.hide();
    } else {
      button.click();
    }
  }

  private getOrderedButtons(buttons: ModalButtonListInterface): ModalButtonInterface[] {
      return values(buttons).sort((a, b) => a.order - b.order);
  }
}
