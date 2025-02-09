import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MessageBus } from '@pe/common';

import { OPTIONS } from '../../constants';


@Component({
  selector: 'pe-builder-view',
  templateUrl: './builder-view.component.html',
  styleUrls: ['./builder-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSubscriptionBuilderViewComponent {
  options = OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<PebSubscriptionBuilderViewComponent>,
    private messageBus: MessageBus,
  ) {
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(value) {
    this.messageBus.emit('subscriptions.set.builder_view', value);
  }

}
