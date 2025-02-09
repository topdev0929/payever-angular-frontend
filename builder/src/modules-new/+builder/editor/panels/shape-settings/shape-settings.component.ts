// TODO fix this tslint issue
/* tslint:disable:max-file-line-count */
import { Component, Injector, Input, OnInit } from '@angular/core';

import { PebElementType, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { ShapeElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/shape.component';
import { ShapesElementTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import {
  ColorPickerChangeEvent,
  ColorPickerFormat,
  ErrorBag,
  FormScheme,
  FormSchemeField,
  InputChangeEvent,
  InputType,
  SelectChangeEvent,
} from '@pe/ng-kit/modules/form';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';
import {
  BorderCategory,
  BorderStyle,
  ShadowCategory,
  ShapeBorderInterface,
  ShapeShadowInterface,
  ShapeWidgetSettingsInterface,
} from '../../../entities/navbar';
import { isNil, get } from 'lodash-es';

const DEFAULT_OPACITY = 1;
const DEFAULT_BORDER: ShapeBorderInterface = {
  width: 1,
  color: '#000000',
  style: BorderStyle.Solid,
};

const DEFAULT_BOX_SHADOW: ShapeShadowInterface = {
  offset: 2,
  blur: 5,
  color: 'rgba(0, 0, 0, 0.5)',
};

@Component({
  selector: 'pe-builder-shape-settings',
  templateUrl: 'shape-settings.component.html',
  styleUrls: ['shape-settings.component.scss'],
  providers: [ErrorBag],
})
export class NavbarShapeSettingsComponent extends WidgetsSettingsBase<ShapeWidgetSettingsInterface> implements OnInit {
  builderElement: PebElementType = PebElementType.Shape;

  backgroundColorFieldset: FormSchemeField[];
  hoverColorFieldset: FormSchemeField[];
  colorPanelFieldset: FormSchemeField[];
  cornersFieldset: FormSchemeField[];
  borderStyleFieldset: FormSchemeField[];
  borderCategoryFieldset: FormSchemeField[];
  borderColorFieldset: FormSchemeField[];
  borderWidthFieldset: FormSchemeField[];
  opacityInputFieldset: FormSchemeField[];
  shadowCategoryFieldset: FormSchemeField[];
  boxShadowBlurFieldset: FormSchemeField[];
  boxShadowColorFieldset: FormSchemeField[];
  boxShadowOffsetYFieldset: FormSchemeField[];
  lineHeightFieldset: FormSchemeField[];

  formScheme: FormScheme;
  component: ShapeElementComponent;

  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;

  constructor(protected injector: Injector) {
    super(injector);
  }

  get shapeType(): string {
    return this.component && this.component.element.data.type;
  }

  get borderCategory(): BorderCategory {
    const border: ShapeBorderInterface = this.parseBorder();

    return this.component && this.component.variant !== ShapesElementTypes.Line && border.width
      ? BorderCategory.Line
      : BorderCategory.NoBorder;
  }

  get shadowCategory(): ShadowCategory {
    const shadow: { offset: number; color: string; blur: number } = this.parseShadow();

    return shadow.color ? ShadowCategory.DropShadow : ShadowCategory.NoShadow;
  }

  get hoverColor(): string {
    return this.component && this.component.getScreenStyle(this.component.style.backgroundHover);
  }

  onFormKey(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();
    }
  }

  openColorPicker(e: any): void {
    this.editor.editedElement = this.component.id;
  }

  getInitialData(): ShapeWidgetSettingsInterface {
    const border: ShapeBorderInterface = this.parseBorder();
    const shadow: { offset: number; color: string; blur: number } = this.parseShadow();

    const styleOpacity = this.component && isNil(this.component.styleOpacity) ? DEFAULT_OPACITY : this.component.styleOpacity;

    return {
      borderCategory: this.borderCategory,
      shadowCategory: this.shadowCategory,
      styles: {
        borderStyle: (border.style as BorderStyle) || DEFAULT_BORDER.style,
        borderWidth: border.width || DEFAULT_BORDER.width,
        borderColor: border.color || DEFAULT_BORDER.color,
        opacity: styleOpacity * 100,
        boxShadowBlur: shadow.blur || DEFAULT_BOX_SHADOW.blur,
        boxShadowColor: shadow.color || DEFAULT_BOX_SHADOW.color,
        boxShadowOffsetY: shadow.offset || DEFAULT_BOX_SHADOW.offset,
        backgroundColor: this.component.getScreenStyle(this.component.style.background),
        hoverColor: this.hoverColor,
        borderRadius: this.component && (this.component.getScreenStyle(this.component.style.borderRadius) as number),
        lineHeightFieldset: this.component && this.component.getScreenStyle(this.component.style.height),
      },
    };
  }

  removeHover(): void {
    this.form.get('styles.hoverColor').setValue(null);
    this.updateData({ style: { backgroundHover: null } });
  }

  protected updateBorder(): void {
    if (this.form.get('borderCategory').value === BorderCategory.Line) {
      const bColor: string = this.form.get('styles.borderColor').value;
      const bWidth: string = this.form.get('styles.borderWidth').value;
      const bStyle: string = this.form.get('styles.borderStyle').value;
      if (bColor) {
        this.updateColorFieldset$.next({
          style: {
            borderColor: bColor,
            borderStyle: bStyle,
            borderWidth: bWidth,
          },
        });
      }
    }
  }

  protected updateShadow(): void {
    if (this.form.get('shadowCategory').value === ShadowCategory.DropShadow) {
      const blur: number = this.form.get('styles.boxShadowBlur').value || DEFAULT_BOX_SHADOW.blur;
      const offset: number = this.form.get('styles.boxShadowOffsetY').value || DEFAULT_BOX_SHADOW.offset;
      const color: string = this.form.get('styles.boxShadowColor').value || DEFAULT_BOX_SHADOW.color;
      this.updateColorFieldset$.next({ style: { boxShadow: `${color} 0px ${offset}px ${blur}px` } });
    }
  }

  protected createForm(initialData: ShapeWidgetSettingsInterface): void {
    if (!this.component) {
      return;
    }
    const data = this.getInitialData();

    this.form = this.formBuilder.group({
      borderCategory: [data.borderCategory],
      shadowCategory: [data.shadowCategory],
      styles: this.formBuilder.group({
        backgroundColor: [data.styles.backgroundColor],
        borderColor: [data.styles.borderColor],
        hoverColor: [data.styles.hoverColor],
        borderRadius: [data.styles.borderRadius],
        borderStyle: [data.styles.borderStyle],
        borderWidth: [data.styles.borderWidth],
        boxShadowBlur: [data.styles.boxShadowBlur],
        boxShadowOffsetY: [data.styles.boxShadowOffsetY],
        boxShadowColor: [data.styles.boxShadowColor],
        lineHeightFieldset: [data.styles.lineHeightFieldset],
        opacity: [data.styles.opacity],
      }),
    });

    this.formScheme = {
      fieldsets: {
        lineHeightFieldset: [
          {
            name: 'styles.lineHeightFieldset',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-sm with-controls',
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: this.translateService.translate('shape_settings.font_size'),
              showNumberControls: true,
              numberMin: 1,
              numberMax: 10,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                this.updateData({ style: { height: event.value } });
              },
            },
          },
        ],
        backgroundColorFieldset: [
          {
            name: 'styles.backgroundColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-12 mat-toolbar-append-item',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onOpened: e => {
                this.editor.editedElement = this.component.id;
              },
              onClosed: e => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                this.updateColorFieldset$.next({ style: { background: event.value } });
              },
            },
          },
        ],
        hoverColorFieldset: [
          {
            name: 'styles.hoverColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-12 mat-toolbar-append-item',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onOpened: e => {
                this.editor.editedElement = this.component.id;
              },
              onClosed: e => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                this.updateColorFieldset$.next({ style: { backgroundHover: event.value } });
              },
            },
          },
        ],
        colorPanelFieldset: [
          {
            name: 'styles.backgroundColor',
            type: 'color-panel',
            fieldSettings: {
              classList: 'col-xs-12 mat-toolbar-append-item',
              label: '',
            },
            colorPanelSettings: {
              format: ColorPickerFormat.RGBA,
              onValueChange: (event: any): void => {
                this.updateColorFieldset$.next({ style: { background: event.value } });
              },
            },
          },
        ],
        cornersFieldset: [
          {
            name: 'styles.borderRadius',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-xs with-controls',
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: this.translateService.translate('shape_settings.radius'),
              showNumberControls: true,
              numberMin: 0,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                this.updateData({ style: { borderRadius: event.value } });
              },
            },
          },
        ],
        borderCategoryFieldset: [
          {
            name: 'borderCategory',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-md select-fieldset',
              label: '',
            },
            selectSettings: {
              disableOptionCentering: true,
              placeholder: '',
              panelClass: 'mat-select-dark mat-select-horizontal',
              options: Object.keys(BorderCategory)
                .map((key: string) => BorderCategory[key])
                .map((borderCategory: BorderCategory) => {
                  return {
                    label: this.translateService.translate(
                      borderCategory === BorderCategory.NoBorder
                        ? 'shape_settings.no_border'
                        : 'shape_settings.border_line',
                    ),
                    value: borderCategory,
                  };
                }),
              onValueChange: (event: SelectChangeEvent): void => {
                if (event.value === this.borderCategory) {
                  return;
                }
                if (event.value === BorderCategory.NoBorder) {
                  this.updateData({
                    style: {
                      border: 'none',
                      borderWidth: null,
                      borderStyle: null,
                      borderColor: null,
                    },
                  });
                }
              },
            },
          },
        ],
        borderStyleFieldset: [
          {
            name: 'styles.borderStyle',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-sm select-fieldset',
              label: '',
            },
            selectSettings: {
              disableOptionCentering: true,
              panelClass: 'mat-select-dark mat-select-horizontal',
              options: Object.keys(BorderStyle)
                .map((key: string) => BorderStyle[key])
                .filter((borderStyle: BorderStyle) => borderStyle !== BorderStyle.None)
                .map((borderStyle: BorderStyle) => {
                  return {
                    label: borderStyle.charAt(0).toUpperCase() + borderStyle.slice(1),
                    value: borderStyle,
                  };
                }),
              onValueChange: (event: any): void => {
                const border: ShapeBorderInterface = this.parseBorder();
                if (border.style === event.value) {
                  return;
                }
                this.updateBorder();
              },
            },
          },
        ],
        borderColorFieldset: [
          {
            name: 'styles.borderColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-12  mat-toolbar-append-item',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.HEX,
              onOpened: e => {
                this.editor.editedElement = this.component.id;
              },
              onClosed: e => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                this.updateBorder();
              },
            },
          },
        ],
        borderWidthFieldset: [
          {
            name: 'styles.borderWidth',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-xs with-controls',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: 'Width',
              showNumberControls: true,
              numberMin: 0,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (): void => {
                this.updateBorder();
              },
            },
          },
        ],
        opacityInputFieldset: [
          {
            name: 'styles.opacity',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-xs with-controls',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: 'Opacity',
              showNumberControls: true,
              numberMin: 0,
              numberMax: 100,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: InputChangeEvent): void => {
                this.updateData({ style: { opacity: Number(event.value) / 100 } });
              },
            },
          },
        ],
        shadowCategoryFieldset: [
          {
            name: 'shadowCategory',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-md select-fieldset',
              label: '',
            },
            selectSettings: {
              disableOptionCentering: true,
              placeholder: '',
              panelClass: 'mat-select-dark mat-select-horizontal',
              options: Object.keys(ShadowCategory)
                .map((key: string) => ShadowCategory[key])
                .map((shadowCategory: ShadowCategory) => {
                  return {
                    label: this.translateService.translate(
                      shadowCategory === ShadowCategory.NoShadow
                        ? 'shape_settings.no_shadow'
                        : 'shape_settings.drop_shadow',
                    ),
                    value: shadowCategory,
                  };
                }),
              onValueChange: (event: SelectChangeEvent): void => {
                if (event.value === this.shadowCategory) {
                  return;
                }
                if (event.value === ShadowCategory.NoShadow) {
                  this.updateData({ style: { boxShadow: 'none' } });
                } else {
                  this.updateShadow();
                }
              },
            },
          },
        ],
        boxShadowBlurFieldset: [
          {
            name: 'styles.boxShadowBlur',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-xs with-controls',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              numberMin: 0,
              numberMax: 100,
              placeholder: 'Blur',
              showNumberControls: true,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (): void => {
                this.updateShadow();
              },
            },
          },
        ],
        boxShadowColorFieldset: [
          {
            name: 'styles.boxShadowColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-12 mat-toolbar-append-item',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onOpened: e => {
                this.editor.editedElement = this.component.id;
              },
              onClosed: e => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: ColorPickerChangeEvent): void => {
                this.updateShadow();
              },
            },
          },
        ],
        boxShadowOffsetYFieldset: [
          {
            name: 'styles.boxShadowOffsetY',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-xs with-controls',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              numberMin: 0,
              numberMax: 100,
              placeholder: 'Offset',
              showNumberControls: true,
              onFocus: (): void => {
                this.editor.editedElement = this.component.id;
              },
              onBlur: (): void => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: InputChangeEvent): void => {
                this.updateShadow();
              },
            },
          },
        ],
      },
    };

    Object.keys(this.formScheme.fieldsets).forEach((key: string) => {
      this[key] = this.formScheme.fieldsets[key];
    });

    this.changeDetectorRef.detectChanges();
  }

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: ShapeWidgetSettingsInterface): void {}

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}

  private parseBorder(): ShapeBorderInterface {
    const border: ShapeBorderInterface = {
      width: null,
      style: null,
      color: null,
    };
    if (this.component) {
      border.width = this.component.getScreenStyle(this.component.style.borderWidth);
      border.style = this.component.getScreenStyle(this.component.style.borderStyle) as BorderStyle;
      border.color = this.component.getScreenStyle(this.component.style.borderColor);
    }

    return border;
  }

  private parseShadow(): ShapeShadowInterface {
    const boxShadow: ShapeShadowInterface = {
      offset: null,
      blur: null,
      color: null,
    };
    if (this.component) {
      const shadowStyle: string = this.component.getScreenStyle(this.component.style.boxShadow);
      if (shadowStyle) {
        const shadowArray: string[] = shadowStyle.split(' ');

        if (shadowArray && shadowArray.length) {
          boxShadow.offset = shadowArray[shadowArray.length - 2]
            ? Number(shadowArray[shadowArray.length - 2].slice(0, -2))
            : 0;
          boxShadow.blur = shadowArray[shadowArray.length - 1]
            ? Number(shadowArray[shadowArray.length - 1].slice(0, -2))
            : 0;
          boxShadow.color = shadowStyle.slice(shadowStyle.indexOf('rgb'), shadowStyle.indexOf(')') + 1);
        }
      }
    }

    return boxShadow;
  }
}
