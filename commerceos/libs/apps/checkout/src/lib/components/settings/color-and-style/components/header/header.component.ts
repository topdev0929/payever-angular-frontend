import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { ScreenTypeEnum, SizeUnitEnum, StyleItemTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';
import { FormControlSchemeFactory } from '../../utils';

export const HEADER_STYLES_SCHEME: FormSchemeInterface = {
  groups: [{
    controls: [{
      controlName: 'businessHeaderBackgroundColor',
      labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderBackgroundColor',
      type: StyleItemTypeEnum.ColorPicker,
      buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
    },
    {
      controlName: 'businessHeaderBorderColor',
      labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderBorderColor',
      type: StyleItemTypeEnum.ColorPicker,
      buttonLabelKey: 'settings.colorAndStyle.actions.changeColor',
    }],
  },
  {
    controls: FormControlSchemeFactory(
      'businessHeader',
      'Height',
      {
        labelKey: 'settings.colorAndStyle.panelBusinessHeader.controls.businessHeaderHeight',
        type: StyleItemTypeEnum.InputSize,
        screen: Object.values(ScreenTypeEnum),
        min: 0,
        max: 200,
        excludeUnits: [SizeUnitEnum.Percent],
      }
    ),
  }],
};

@Component({
  selector: 'pe-header-styles',
  template: `
    <pe-style-from-scheme
      *ngIf="formScheme"
      [formScheme]="formScheme"
      [parentForm]="parentForm"
    ></pe-style-from-scheme>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderStylesComponent extends BaseSettingsSectionComponent implements OnInit {
  formScheme: FormSchemeInterface;

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.formScheme = HEADER_STYLES_SCHEME;
  }
}
