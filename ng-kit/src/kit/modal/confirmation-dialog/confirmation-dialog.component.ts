import { Output,
         Component,
         AfterViewInit,
         ViewChild,
         EventEmitter,
         OnInit,
         OnDestroy
       } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Subscription } from 'rxjs';

import { ConfirmationDialogConfig } from './confirmation-dialog.config';

@Component({
  selector: 'pe-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) public modal: ModalDirective;

  @Output() public confirm: EventEmitter<any> = new EventEmitter();
  @Output() public cancel: EventEmitter<any> = new EventEmitter();
  @Output() public hide: EventEmitter<any> = new EventEmitter();
  @Output() public show: EventEmitter<any> = new EventEmitter();

  public config: ConfirmationDialogConfig;

  protected onHideSub: Subscription;
  protected onShowSub: Subscription;

  setConfig(config: ConfirmationDialogConfig): void {
    this.config = config;
  }

  ngAfterViewInit(): void {
    this.modal.show();
  }

  ngOnInit(): void {
    this.onHideSub = this.modal.onHidden.subscribe(() => {
      this.hide.emit();
    });

    this.onShowSub = this.modal.onShow.subscribe(() => {
      this.show.emit();
    });
  }

  ngOnDestroy(): void {
    this.onHideSub.unsubscribe();
    this.onShowSub.unsubscribe();
  }

  onConfirmClick(): void {
    this.confirm.emit();
    this.modal.hide();
  }

  onCloseClick(): void {
    this.cancel.emit();
    this.modal.hide();
  }
}
