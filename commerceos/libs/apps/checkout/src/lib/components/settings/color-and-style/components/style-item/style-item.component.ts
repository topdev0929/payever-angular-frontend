import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { SizeUnitEnum, StyleItemTypeEnum } from '../../enums';

@Component({
  selector: 'pe-style-item',
  templateUrl: './style-item.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleItemComponent {
  @Input() control: AbstractControl;
  @Input() type: StyleItemTypeEnum;
  @Input() buttonLabelTranslateKey: string;
  @Input() labelTranslateKey: string;
  @Input() min = 0;
  @Input() max = Number.MAX_SAFE_INTEGER;
  @Input() excludeUnits: SizeUnitEnum[] = [];

  StyleItemTypeEnum: typeof StyleItemTypeEnum = StyleItemTypeEnum
}
