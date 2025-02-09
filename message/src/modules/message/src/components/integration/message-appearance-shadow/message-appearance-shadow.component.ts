import {
  Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input, Output,
  EventEmitter, SimpleChanges, OnChanges, ChangeDetectorRef,
} from '@angular/core';
import { PeMessageIntegrationSettings } from '../../../enums';

@Component({
  selector: 'pe-message-appearance-shadow',
  templateUrl: './message-appearance-shadow.component.html',
  styleUrls: ['./message-appearance-shadow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageAppearanceShadowComponent implements OnInit, OnChanges {

  @Input() shadowColor!: string;

  @Output() changed = new EventEmitter<string>();

  showMessageShadow = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.showMessageShadow = !!this.shadowColor;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.shadowColor) {
      this.initShadow(changes.shadowColor.currentValue);
    }
  }

  initShadow(value: string): void {
    this.shadowColor = value;
    this.showMessageShadow = !!value;

    this.changeDetectorRef.detectChanges();
  }

  disable(): void {
    this.changed.emit(this.showMessageShadow ? PeMessageIntegrationSettings.shadow : '');
    this.shadowColor = this.showMessageShadow ? PeMessageIntegrationSettings.shadow : '';
  }

  change(event: string): void {
    this.changed.emit(event);
  }
}
