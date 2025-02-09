import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { FlowInterface } from '@pe/checkout/types';

export interface ModalButtonInterface {
  title?: string;
  click?: () => void;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'error-flow-finished',
  templateUrl: 'error-flow-finished.component.html',
})
export class ErrorFlowFinishedComponent implements OnDestroy {

  @Input() set flow(flow: FlowInterface) {
    this.returnButton$.next({
      title: $localize `:@@action.return_to_store:`,
      click: () => {
        window.top.location.href = flow.shopUrl;
      },
    });
  }

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  returnButton$: BehaviorSubject<ModalButtonInterface> = new BehaviorSubject<ModalButtonInterface>(null);
  private dialogRef: MatDialogRef<any> = null;

  ngOnDestroy() {
    this.dialogRef?.close();
  }
}
