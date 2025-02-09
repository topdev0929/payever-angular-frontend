import {
  Component, ChangeDetectionStrategy, Input, EventEmitter, Output, SimpleChanges, OnChanges, ViewEncapsulation,
} from '@angular/core';

import { PeMessageAppearanceColorBox, PeMessageColorLayout, PeMessageIntegrationThemeItem } from '@pe/message/shared';

@Component({
  selector: 'pe-message-theme-settings',
  templateUrl: './message-theme-settings.component.html',
  styleUrls: ['./message-theme-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MessageThemeSettingsComponent implements OnChanges {
  public blurMode: boolean;

  @Input() mockUps!: PeMessageIntegrationThemeItem[];
  @Input() swiperColorBoxes!: boolean;
  @Input() defaultPresetColor = 0;
  @Input() colorBoxes!: PeMessageAppearanceColorBox[];
  @Input() shadowColor!: string;
  @Input() blurValue!: string;

  @Output() colorLayout = new EventEmitter<PeMessageColorLayout>();
  @Output() mockUpLayout = new EventEmitter<PeMessageIntegrationThemeItem>();
  @Output() changedBoxShadow = new EventEmitter<string>();
  @Output() changedBlurMode = new EventEmitter<string>();

  isMobile = window.innerWidth <= 480;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.shadowColor) {
      this.shadowColor = changes.shadowColor.currentValue;
    }
    if (changes.blurValue) {
      this.blurValue = changes.blurValue.currentValue;
    }
  }

  openColorPicker(boxColor: PeMessageAppearanceColorBox | null, index: number): void {
    this.colorLayout.emit({ boxColor: boxColor, index: index });
  }

  selectMockUp(mockUp: PeMessageIntegrationThemeItem): void {
    this.mockUpLayout.emit(mockUp);
  }

  changeBoxShadow(event: string): void {
    this.changedBoxShadow.emit(event);
  }

  changeBlurMode(event: string): void {
    this.changedBlurMode.emit(event);
    this.blurValue = event;
  }
}
