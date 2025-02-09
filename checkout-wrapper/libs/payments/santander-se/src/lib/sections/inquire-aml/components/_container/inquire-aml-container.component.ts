import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { ModeEnum } from '@pe/checkout/form-utils';
import { PeDestroyService } from '@pe/destroy';

@Component({
  selector: 'pe-santander-se-inquire-aml',
  templateUrl: './inquire-aml-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class InquireAmlContainerComponent {
  @Input() mode: ModeEnum;

  @Output() submitted = new EventEmitter<any>();

  public readonly modeEnum = ModeEnum;

  public onSubmit(event: any): void {
    this.submitted.emit(event);
  }
}
