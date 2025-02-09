import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { BaseSettingsSectionComponent } from '../../base-settings-section';
import { ALIGNMENTS } from '../../constants';
import { StyleItemTypeEnum, ScreenTypeEnum } from '../../enums';
import { FormSchemeInterface } from '../../interfaces';
import { ScreenTypeStylesService } from '../../services/screen-type.service';
import { FormControlSchemeFactory } from '../../utils';

export const LOGO_STYLES_SCHEME: FormSchemeInterface = {
  groups: [{
    controls: [
      ...FormControlSchemeFactory(
        'businessLogo',
        'Width',
        {
          labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoWidth',
          type: StyleItemTypeEnum.InputSize,
          screen: Object.values(ScreenTypeEnum),
          min: 0,
          max: 500,
        }
      ),
      ...FormControlSchemeFactory(
        'businessLogo',
        'Height',
        {
          labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoHeight',
          type: StyleItemTypeEnum.InputSize,
          screen: Object.values(ScreenTypeEnum),
        }
      ),
    ],
  }, {
    modals: [{
      titleKey: 'settings.colorAndStyle.panelLogo.modals.padding',
      controls: [
        ...FormControlSchemeFactory(
          'businessLogo',
          'PaddingTop',
          {
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingTop',
            type: StyleItemTypeEnum.InputSize,
            screen: Object.values(ScreenTypeEnum),
          }
        ),
        ...FormControlSchemeFactory(
          'businessLogo',
          'PaddingRight',
          {
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingRight',
            type: StyleItemTypeEnum.InputSize,
            screen: Object.values(ScreenTypeEnum),
          }
        ),
        ...FormControlSchemeFactory(
          'businessLogo',
          'PaddingBottom',
          {
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingBottom',
            type: StyleItemTypeEnum.InputSize,
            screen: Object.values(ScreenTypeEnum),
          }
        ),
        ...FormControlSchemeFactory(
          'businessLogo',
          'PaddingLeft',
          {
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoPaddingLeft',
            type: StyleItemTypeEnum.InputSize,
            screen: Object.values(ScreenTypeEnum),
          }
        ),
      ],
    },
    {
      titleKey: 'settings.colorAndStyle.panelLogo.modals.alignment',
      controls: [
        ...FormControlSchemeFactory(
          'businessLogo',
          'Alignment',
          {
            labelKey: 'settings.colorAndStyle.panelLogo.controls.businessLogoAlignment.title',
            type: StyleItemTypeEnum.Alignment,
            screen: Object.values(ScreenTypeEnum),
          },
        ),
      ],
    }],
  }],
};

@Component({
  selector: 'pe-logo-styles',
  template: `
    <pe-style-from-scheme
      *ngIf="formScheme"
      [formScheme]="formScheme"
      [parentForm]="parentForm"
    ></pe-style-from-scheme>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoStylesComponent extends BaseSettingsSectionComponent implements OnInit {
  readonly alignmentIcons = ALIGNMENTS;

  formScheme: FormSchemeInterface;

  constructor(
    protected injector: Injector,
    private screenTypeStylesService: ScreenTypeStylesService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.formScheme = LOGO_STYLES_SCHEME;
  }
}
