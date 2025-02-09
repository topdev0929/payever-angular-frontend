import { Component, Injector, Input, OnInit } from '@angular/core';

import { PebElementStyling, PebElementType, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { CartElementComponent } from '@pe/builder-editor/projects/modules/elements/src/business/cart/cart.component';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { ColorPickerFormat, ErrorBag, FormScheme, FormSchemeField } from '@pe/ng-kit/modules/form';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';
import { CartIconWidgetSettingsInterface } from '../../../entities/navbar';

@Component({
  selector: 'pe-builder-cart-icon-settings',
  templateUrl: 'navbar-cart-icon-settings.component.html',
  styles: [
    `
      :host::ng-deep.select-fieldset {
        padding-top: 5px;
      }
    `,
  ],
  providers: [ErrorBag],
})
export class NavbarCartIconSettingsComponent extends WidgetsSettingsBase<CartIconWidgetSettingsInterface>
  implements OnInit {
  builderElement: PebElementType = PebElementType.Cart;
  formScheme: FormScheme;
  colorFieldset: FormSchemeField[];
  showNumberFieldset: FormSchemeField[];
  quantityBackgroundFieldset: FormSchemeField[];
  component: CartElementComponent;

  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;

  constructor(protected injector: Injector) {
    super(injector);
  }

  getInitialData(): CartIconWidgetSettingsInterface {
    return {
      showNumber: this.component.element.data && this.component.element.data.showQuantity,
      styles: {
        textColor: this.component.styleColor,
        quantityBackgroundColor: this.component.notificationBackground,
      },
    };
  }

  protected createForm(initialData: CartIconWidgetSettingsInterface): void {
    const data = this.getInitialData();
    this.form = this.formBuilder.group({
      showNumber: [data.showNumber],
      styles: this.formBuilder.group({
        textColor: [data.styles.textColor],
        quantityTextColor: [data.styles.quantityTextColor],
        quantityBackgroundColor: [data.styles.quantityBackgroundColor],
      }),
    });

    this.formScheme = {
      fieldsets: {
        colorFieldset: [
          {
            name: 'styles.textColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-0',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onValueChange: (event: any): void => {
                this.updateColorFieldset$.next({ style: { color: event.value } });
              },
            },
          },
        ],
        showNumberFieldset: [
          {
            name: 'showNumber',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-md select-fieldset',
              label: data.showNumber 
                ? this.translateService.translate('content_editor.cart_icon_widget_settings.quantity_type.number')
                : this.translateService.translate('content_editor.cart_icon_widget_settings.quantity_type.dot'),
            },
            selectSettings: {
              disableOptionCentering: true,
              panelClass: 'mat-select-dark mat-select-horizontal',
              options: [
                {
                  label: 'Number',
                  value: true,
                },
                {
                  label: 'Dot',
                  value: false,
                },
              ],
              onValueChange: (event: any): void => {
                this.updateData({ data: { showQuantity: !!event.value } });
              },
            },
          },
        ],
        quantityBackgroundFieldset: [
          {
            name: 'styles.quantityBackgroundColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-0',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onOpened: () => {
                this.editor.editedElement = this.component.id;
              },
              onClosed: () => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                const styling: PebElementStyling = this.setStylesForOtherScreens({ notificationBackground: event.value });
                this.updateColorFieldset$.next({ data: styling });
              },
            },
          },
        ],
        quantityTextFieldset: [
          {
            name: 'styles.quantityTextColor',
            type: 'color-picker',
            fieldSettings: {
              classList: 'col-xs-0',
              label: '',
            },
            colorPickerSettings: {
              alpha: true,
              format: ColorPickerFormat.RGBA,
              onOpened: () => {
                this.editor.editedElement = this.component.id;
              },
              onClosed: () => {
                this.editor.editedElement = null;
              },
              onValueChange: (event: any): void => {
                this.updateColorFieldset$.next({ data: { quantityColor: event.value } });
              },
            },
          },
        ],
      },
    };

    this.colorFieldset = this.formScheme.fieldsets.colorFieldset;
    this.showNumberFieldset = this.formScheme.fieldsets.showNumberFieldset;
    this.quantityBackgroundFieldset = this.formScheme.fieldsets.quantityBackgroundFieldset;
    this.changeDetectorRef.detectChanges();
  }

  protected normalizeWidgetSettings(settings: CartIconWidgetSettingsInterface): CartIconWidgetSettingsInterface {
    return settings || {};
  }

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: CartIconWidgetSettingsInterface): void {}

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}
}
