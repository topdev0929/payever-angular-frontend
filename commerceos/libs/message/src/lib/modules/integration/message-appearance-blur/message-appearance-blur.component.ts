import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import { PeMessageIntegrationSettings } from '@pe/shared/chat';

@Component({
  selector: 'pe-message-appearance-blur',
  templateUrl: './message-appearance-blur.component.html',
  styleUrls: ['./message-appearance-blur.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageAppearanceBlurComponent implements OnInit, OnChanges {
  showBlurMode = false;

  @Input() blurValue!: string ;

  @Output() changed = new EventEmitter<string>();

  @HostListener('touched') onTouch() {
    this.onTouched();
  }

  @HostListener('click') onClick(e: Event) {
    this.onTouched();
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  private onChange = (value: string) => {};
  private onTouched = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    this.initBlur(value);
  }

  ngOnInit(): void {
    this.showBlurMode = !!this.blurValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.blurValue) {
      this.initBlur(changes.blurValue.currentValue);
    }
  }

  initBlur(value: string): void {
    this.blurValue = value;
    this.showBlurMode = !!value;

    this.changeDetectorRef.detectChanges();
  }

  disable(): void {
    this.changed.emit(this.showBlurMode ? PeMessageIntegrationSettings.blurValue : '');
    this.blurValue = this.showBlurMode ? PeMessageIntegrationSettings.blurValue : '';
  }

  change(event: string): void {
    this.onChange(event);
    this.changed.emit(event);
  }
}
