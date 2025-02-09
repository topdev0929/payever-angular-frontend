import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RateOption } from '../../rate.interface';

/**
 * @deprecated Should be removed after migration to pe-choose-rate
 */
@Component({
  selector: 'pe-rate',
  templateUrl: 'rate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RateComponent {
  @Input() isSelected: boolean;
  @Input() isSelectable: boolean = true;
  @Input() isDeselectable: boolean = true;
  @Input() isEditable: boolean = false;
  @Input() rateAmount: string;
  @Input() rateAmountSingleLine: boolean = false;
  @Input() rateOptions: RateOption[];
  @Output('onSelect') selectEvent = new EventEmitter<boolean>();
  @Output('onEdit') onEdit = new EventEmitter<boolean>();

  toggleSelected(): void {
    if (this.isSelectable) {
      this.isSelected = this.isDeselectable ? !this.isSelected : true;
      this.selectEvent.emit(this.isSelected);
    }
  }

  edit(event: Event): void {
    event.stopPropagation();
    this.onEdit.emit();
  }
}
