import { AfterViewInit, Injector, Input } from '@angular/core';

import { PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { parseUrl } from '@pe/builder-editor/projects/modules/editor/src/utils';
import { ButtonElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/button-component/button.component';
import { ButtonElementTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { isValidURL } from '@pe/builder-text-editor-compat';
import { FormScheme, FormSchemeField } from '@pe/ng-kit/modules/form';
import {
  CheckboxLabelPosition,
  CheckboxSize,
  ColorPickerFormat,
  InputChangeEvent,
  InputType,
} from '@pe/ng-kit/modules/form/index';
import { LinksInterface } from '@pe/ng-kit/modules/text-editor';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';
import {
  BaseButtonWidgetSettingsInterface,
  ButtonWidgetSettingsInterface,
  ButtonWidgetStylesInterface,
} from '../../../entities/navbar';

const DEFAULT_BORDER_WIDTH = 0;

export abstract class BaseButtonWidgetSettingsComponent<T> extends WidgetsSettingsBase<T>
  implements AfterViewInit {

  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;

  component: any;
  formScheme: FormScheme;
  textStylesFieldset: FormSchemeField[];
  colorFieldset: FormSchemeField[];
  cornersFieldset: FormSchemeField[];
  borderWidthFieldset: FormSchemeField[];

  abstract hasPagesBlock: boolean;

  constructor(protected injector: Injector) {
    super(injector);
  }

  // FIXME rewrite it. Dont use getter
  abstract get currentPageName(): string;

  abstract isActiveLink(page: LinksInterface): boolean;

  abstract setCurrentPage(page: LinksInterface): void;

  abstract getInitialData(): T;

  protected abstract createForm(initialData: ButtonWidgetSettingsInterface): void;

  getBaseFormScheme(): any {
    return {
      textFieldset: [
          {
            name: 'text',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12',
              label: '',
            },
            inputSettings: {
              placeholder: null,
              onValueChange: (event: any): void => {
                this.updateData({ text: event.value });
              },
            },
          },
      ],
      textStylesFieldset: [
        {
          name: 'styles.fontSize',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-0 mat-toolbar-append-item-sm',
          },
          inputSettings: {
            type: InputType.Number,
            numberMin: 1,
            placeholder: this.translateService.translate('content_editor.base_widget_settings.font_size'),
            showNumberControls: true,
            onValueChange: (event: any): void => {
              this.updateData({ style: { fontSize: event.value } });
            },
          },
        },
      ],
      colorFieldset: [
        {
          name: 'styles.textColor',
          type: 'color-picker',
          fieldSettings: {
            classList: 'col-xs-12',
            label: this.translateService.translate('content_editor.base_widget_settings.text'),
          },
          colorPickerSettings: {
            alpha: true,
            format: ColorPickerFormat.RGBA,
            onValueChange: (event: any): void => {
              this.updateColorFieldset$.next({ style: { color: event.value } });
            },
          },
        },
        {
          name: 'styles.backgroundColor',
          type: 'color-picker',
          fieldSettings: {
            classList: 'col-xs-12',
            label: this.translateService.translate('content_editor.base_widget_settings.background'),
          },
          colorPickerSettings: {
            alpha: true,
            format: ColorPickerFormat.RGBA,
            onValueChange: (event: any): void => {
              this.updateColorFieldset$.next({ style: { background: event.value } });
            },
          },
        },
        {
          name: 'styles.borderColor',
          type: 'color-picker',
          fieldSettings: {
            classList: 'col-xs-12',
            label: this.translateService.translate('content_editor.base_widget_settings.border'),
          },
          colorPickerSettings: {
            alpha: true,
            format: ColorPickerFormat.RGBA,
            onValueChange: (event: any): void => {
              this.updateColorFieldset$.next({ style: { borderColor: event.value } });
            },
          },
        },
        {
          name: 'styles.hoverColor',
          type: 'color-picker',
          fieldSettings: {
            classList: 'col-xs-12',
            label: this.translateService.translate('content_editor.base_widget_settings.hover'),
          },
          colorPickerSettings: {
            alpha: true,
            format: ColorPickerFormat.RGBA,
            onValueChange: (event: any): void => {
              this.updateColorFieldset$.next({ style: { backgroundHover: event.value } });
            },
          },
        },
        {
          name: 'styles.textHoverColor',
          type: 'color-picker',
          fieldSettings: {
            classList: 'col-xs-12',
            label: this.translateService.translate('content_editor.base_widget_settings.text_hover'),
          },
          colorPickerSettings: {
            alpha: true,
            format: ColorPickerFormat.RGBA,
            onValueChange: (event: any): void => {
              this.updateColorFieldset$.next({ style: { textHover: event.value } });
            },
          },
        },
      ],
      cornersFieldset: [
        {
          name: 'styles.borderRadius',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-0',
          },
          inputSettings: {
            type: InputType.Number,
            numberMin: 0,
            showNumberControls: true,
            placeholder: this.translateService.translate('content_editor.base_widget_settings.radius'),
            onValueChange: (event: any): void => {
              this.updateData({ style: { borderRadius: event.value } });
            },
          },
        },
      ],
      borderWidthFieldset: [
        {
          name: 'styles.borderWidth',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-0',
          },
          inputSettings: {
            type: InputType.Number,
            numberMin: 0,
            showNumberControls: true,
            placeholder: this.translateService.translate('content_editor.base_widget_settings.border_width'),
            onValueChange: (event: any): void => {
              this.updateData({ style: { borderWidth: event.value } });
            },
          },
        },
      ],
    };
  }

  getInitialStyleData(): ButtonWidgetStylesInterface {
    return {
      fontWeight: this.component && this.component.styleFontWeight,
      fontSize: this.component && this.component.getScreenStyle(this.component.style.fontSize),
      textColor: this.component && this.component.styleColor,
      backgroundColor: this.component && this.component.getScreenStyle(this.component.style.background),
      textHoverColor: this.component && this.component.getScreenStyle(this.component.style.textHover),
      hoverColor: this.component && this.component.getScreenStyle(this.component.style.backgroundHover),
      borderColor: this.component && this.component.getScreenStyle(this.component.style.borderColor),
      borderRadius: this.component && (this.component.getScreenStyle(this.component.style.borderRadius) as number),
      borderWidth: this.component && (this.component.getScreenStyle(this.component.style.borderWidth) || DEFAULT_BORDER_WIDTH as number),
    };
  }

  onFormKey(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();
    }
  }

  protected normalizeWidgetSettings(
    settingsArg: BaseButtonWidgetSettingsInterface,
  ): BaseButtonWidgetSettingsInterface {
    const settings: BaseButtonWidgetSettingsInterface = settingsArg || {};
    settings.styles = settings.styles || {};

    return settings;
  }

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: ButtonWidgetSettingsInterface): void {}

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}
}
