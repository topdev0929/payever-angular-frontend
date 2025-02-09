import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-content-card',
  templateUrl: './content-card.component.html'
})
export class ContentCardComponent {

  @Input() headingText: string;
  @Input() footerButtonText: string;
  @Input() images: string[];
  @Input() placeholderText: string;
  @Input() placeholderIcon: string;
  @Input() cardButtonText: string;

  @Output() footerButtonClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() cardButtonClicked: EventEmitter<void> = new EventEmitter<void>();

}
