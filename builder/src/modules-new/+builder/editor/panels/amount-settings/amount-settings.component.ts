import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';

import { PebElementType } from '@pe/builder-core';
import { parseUrl } from '@pe/builder-editor/projects/modules/editor/src/utils';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { AmountElementComponent } from '@pe/builder-editor/projects/modules/elements/src/business/amount/amount.component';
import { ButtonElementTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
import { isValidURL } from '@pe/builder-text-editor-compat';
import { BaseFormScheme, FormSchemeField } from '@pe/ng-kit/modules/form';
import { CheckboxLabelPosition, CheckboxSize, ErrorBag, InputChangeEvent } from '@pe/ng-kit/modules/form/index';
import { LinksInterface } from '@pe/ng-kit/modules/text-editor';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';
import { AmountWidgetSettingsInterface } from '../../../entities/navbar';
import { BaseButtonWidgetSettingsComponent } from '../base-button-settings/base-button-settings.component';

@Component({
  selector: 'pe-builder-amount-settings',
  templateUrl: '../base-button-settings/base-button-settings.component.html',
  styleUrls: ['../base-button-settings/base-button-settings.component.scss'],
  providers: [ErrorBag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountWidgetSettingsComponent extends BaseButtonWidgetSettingsComponent<AmountWidgetSettingsInterface> {

  builderElement = PebElementType.Amount;
  component: AmountElementComponent;
  hasPagesBlock = false;

  protected createForm(initialData: AmountWidgetSettingsInterface): void {
    if (!this.component) {
      return;
    }

    const data = this.getInitialData();
    this.form = this.formBuilder.group({
      styles: this.formBuilder.group({
        fontWeight: [data.styles.fontWeight],
        fontSize: [data.styles.fontSize],
        textColor: [data.styles.textColor],
        textHoverColor: [data.styles.textHoverColor],
        backgroundColor: [data.styles.backgroundColor],
        borderColor: [data.styles.borderColor],
        hoverColor: [data.styles.hoverColor],
        borderRadius: [data.styles.borderRadius],
        borderWidth: [data.styles.borderWidth],
      }),
    });

    this.formScheme = {
      fieldsets: {
        ...this.getBaseFormScheme(),
      },
    };

    this.textStylesFieldset = this.formScheme.fieldsets.textStylesFieldset;
    this.colorFieldset = this.formScheme.fieldsets.colorFieldset;
    this.cornersFieldset = this.formScheme.fieldsets.cornersFieldset;
    this.borderWidthFieldset = this.formScheme.fieldsets.borderWidthFieldset;

    this.changeDetectorRef.detectChanges();
  }

  getInitialData(): any {
    return {
      styles: this.getInitialStyleData(),
    };
  }

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {
  }

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: {}): void {
  }

  get currentPageName(): string {
    return '';
  }

  isActiveLink(page: LinksInterface): boolean {
    return false;
  }

  // tslint:disable-next-line:no-empty
  setCurrentPage(page: LinksInterface): void {
  }

}
