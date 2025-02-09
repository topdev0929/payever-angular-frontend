import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';


@Component({
  selector: 'pe-action-layout',
  templateUrl: './action-layout.component.html',
  styleUrls: ['./action-layout.component.scss'],
})
export class ActionLayoutComponent {

  @Input() set isLoading(loading: boolean){
    this.isLoading$.next(loading);
    this.hasLoading = true;
  };

  @Input() submitTitleTranslateKey: string;

  @Input() cancelTranslateKey = 'transactions.actions.cancel';
  @Input() doneTranslateKey = 'transactions.actions.done';
  @Input() disableDoneBtn = false;
  @Input() titleTranslateKey: string;

  @Output() closeEvent = new EventEmitter<void>();
  @Output() submitEvent = new EventEmitter<void>();

  private isLoading$ = new Subject<boolean>();

  private hasLoading = false;

  get useSubmitAction(): boolean {
    return !!this.submitTitleTranslateKey && this.hasLoading;
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  onSubmit():void {
    this.submitEvent.emit();
  }

}
