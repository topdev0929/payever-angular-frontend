import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { PebElement, PebElementProps, PebElementStyling, PebPageStore, PebPageType, PebScreen, PebThemeStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { ProductElementComponent } from '@pe/builder-editor/projects/modules/elements/src/business/product/product.component';
import { getScreenStyle, setScreenStyle } from '@pe/builder-editor/projects/modules/elements/src/utils';
import { ProductDs } from '@pe/builder-editor/projects/modules/shared/interfaces';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import {
  ColorPickerFormat,
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  FormSchemeField,
  InputChangeEvent,
  InputSettingsInterface,
  InputType,
} from '@pe/ng-kit/modules/form';
// tslint:disable-next-line:import-blacklist
import { FormFieldEnum } from '@pe/ng-kit/src/kit/form-core/types';
import { ElementsFactory } from '../../../services/elements.factory';
import { ProductsService } from '../../../services/products.service';

enum ProductDataTypes {
  all = 'All Products',
  individual = 'Individual Products',
}

interface ProductsFormSelections {
  productsSelection: ProductDataTypes;
}

export interface ProductWidgetStylesInterface {
  textColor: string;
  priceColor: string;
}

interface ProductWidgetSettings {
  height: number;
  type: ProductDataTypes;
  width: number;
  styles: ProductWidgetStylesInterface;
}

@Component({
  selector: 'pe-builder-product-settings',
  templateUrl: 'navbar-product-settings.component.html',
  styleUrls: ['navbar-product-settings.component.scss'],
  providers: [ErrorBag, ElementsFactory],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarProductSettingsComponent extends FormAbstractComponent<ProductsFormSelections> implements OnInit {

  get productItemWidth(): number {
    return this.component.element.data && this.component.element.data.itemSize
      ? getScreenStyle(this.component.element.data.itemSize.width, this.component.screen)
      : ProductDs.width;
  }

  get productItemHeight(): number {
    return this.component.element.data && this.component.element.data.itemSize
      ? getScreenStyle(this.component.element.data.itemSize.height, this.component.screen)
      : ProductDs.height;
  }
  @Input() editor: EditorState;
  @Input() pageStore: PebPageStore;
  @Input() registry: ElementsRegistry;

  readonly productSelections: typeof ProductDataTypes = ProductDataTypes;
  productsSelectionFieldset: FormSchemeField[];
  widthFieldset: FormSchemeField[];
  heightFieldset: FormSchemeField[];
  textColorFieldset: FormSchemeField[];
  priceColorFieldset: FormSchemeField[];
  formScheme: FormScheme;
  component: AbstractElementComponent;

  PebPageType = PebPageType;

  private updateElementSubject$: Subject<PebElementProps> = new Subject();
  private updateColorFieldset$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    protected injector: Injector,
    public productsService: ProductsService,
    public themeStore: PebThemeStore,
    private elementsFactory: ElementsFactory,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.updateElementSubject$.pipe(
      debounceTime(1000),
      tap(data => {
        this.pageStore.updateElement(this.component.element.id, data);
        this.elementsFactory.handleParentsResize(this.component);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.updateColorFieldset$
      .pipe(
        debounceTime(300),
        tap(data => {
          if (data && data.hasOwnProperty('style')) {
            data.style = this.setStylesForOtherScreens(data.style);
            this.component.setScreenStyle(data.style);
            this.pageStore.updateElement(this.component.id, data);
          }
        }),
      )
      .subscribe();
  }

  getInitialData(): ProductWidgetSettings {
    this.component = this.registry.getComponent(this.editor.activeElement);
    const width = this.productItemWidth;
    const height = this.productItemHeight;
    const type = this.component.element.data ? this.component.element.data.type : ProductDataTypes.individual;
    const textColor = (this.component as ProductElementComponent).styleTextColor;
    const priceColor = (this.component as ProductElementComponent).stylePriceColor;

    return {
      width,
      height,
      type,
      styles: {
        textColor,
        priceColor,
      },
    };
  }

  protected createForm(initialData: ProductsFormSelections): void {
    const data = this.getInitialData();
    this.form = this.formBuilder.group({
      productsSelection: [data.type],
      width: [data.width, [Validators.required]],
      height: [data.height, [Validators.required]],
      styles: this.formBuilder.group({
        textColor: [data.styles.textColor, [Validators.required]],
        priceColor: [data.styles.priceColor, [Validators.required]],
      }),
    });

    this.formScheme = {
      fieldsets: {
        productsSelectionFieldset: [
          {
            name: 'productsSelection',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-0 mat-toolbar-append-item-md select-fieldset',
              label: '',
            },
            selectSettings: {
              placeholder: 'Custom Selection',
              panelClass: 'mat-select-dark mat-select-horizontal',
              options: Object.keys(ProductDataTypes)
                .map((key: string) => ProductDataTypes[key])
                .map((productSelection: ProductDataTypes) => {
                  return {
                    label: productSelection,
                    value: productSelection,
                  };
                }),
              onValueChange: (e: InputChangeEvent) => {
                if (this.component.element.data.type !== e.value && e.value === ProductDataTypes.all) {
                  this.productsService.addAllProducts(this.editor, this.pageStore, this.registry, this.themeStore.activePage.id);
                  // } else if (e.value === ProductDataTypes.category) {
                  // this.productsService.addAllCategoryProducts(this.editor, this.pageStore, this.registry);
                }
              },
            },
          },
        ],
        widthFieldset: [
          {
            name: 'width',
            type: FormFieldEnum.Input,
            fieldSettings: {
              classList: 'col-xs-18',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              showNumberControls: true,
              onValueChange: (e: InputChangeEvent) => {
                if (e.value && e.value > 0) {
                  const columns = getScreenStyle(this.component.element.data.columns, this.component.screen) || 1;
                  this.component.setScreenStyle({
                    width: (e.value as number) * columns,
                  });
                  const width =
                    this.component.element.data && this.component.element.data.itemSize
                      ? setScreenStyle(
                          this.component.element.data.itemSize.width,
                          Number(e.value),
                          this.component.screen,
                        )
                      : Number(e.value);

                  this.updateElementSubject$.next({
                    data: {
                      itemSize: {
                        height:
                          this.component.element.data && this.component.element.data.itemSize
                            ? this.component.element.data.itemSize.height
                            : 500,
                        width,
                      },
                    },
                  });

                  // this.pageStore.updateElement(this.component.element.id, {
                  //   data: {
                  //     itemSize: {
                  //       height:
                  //         this.component.element.data && this.component.element.data.itemSize
                  //           ? this.component.element.data.itemSize.height
                  //           : 500,
                  //       width,
                  //     },
                  //   },
                  // });
                }
              },
            }, // as InputSettingsInterface,
          },
        ],
        heightFieldset: [
          {
            name: 'height',
            type: FormFieldEnum.Input,
            fieldSettings: {
              classList: 'col-xs-18',
              label: '',
            },
            inputSettings: {
              type: InputType.Number,
              showNumberControls: true,
              onValueChange: (e: InputChangeEvent) => {
                if (e.value && e.value > 0) {
                  const columns = getScreenStyle(this.component.element.data.columns, this.component.screen) || 1;
                  const rows = Math.ceil(
                    this.component.element.data.products ? this.component.element.data.products.length : 1 / columns,
                  );
                  const height = this.component.element.data.itemSize
                    ? setScreenStyle(
                        this.component.element.data.itemSize.height,
                        Number(e.value),
                        this.component.screen,
                      )
                    : Number(e.value);
                  // this.component.setScreenStyle({
                  //   height: Number(e.value) * rows,
                  // });

                  this.updateElementSubject$.next({
                    data: {
                      itemSize: {
                        width: this.component.element.data.itemSize ? this.component.element.data.itemSize.width : 300,
                        height,
                      },
                    },
                  });

                  // this.pageStore.updateElement(this.component.element.id, {
                  //   data: {
                  //     itemSize: {
                  //       width: this.component.element.data.itemSize ? this.component.element.data.itemSize.width : 300,
                  //       height,
                  //     },
                  //   },
                  // });
                }
              },
            }, // as InputSettingsInterface,
          },
        ],
        textColorFieldset: [
          {
            name: 'styles.textColor',
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
                this.updateColorFieldset$.next({ style: { textColor: event.value } });
              },
            },
          },
        ],
        priceColorFieldset: [
          {
            name: 'styles.priceColor',
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
                this.updateColorFieldset$.next({ style: { priceColor: event.value } });
              },
            },
          },
        ],
      },
    };
    this.productsSelectionFieldset = this.formScheme.fieldsets.productsSelectionFieldset;
    this.widthFieldset = this.formScheme.fieldsets.widthFieldset;
    this.heightFieldset = this.formScheme.fieldsets.heightFieldset;
    this.textColorFieldset = this.formScheme.fieldsets.textColorFieldset;
    this.priceColorFieldset = this.formScheme.fieldsets.priceColorFieldset;

    this.changeDetectorRef.detectChanges();
  }

  openColorPicker(e: any): void {
    this.editor.editedElement = this.component.id;
  }

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: ProductsFormSelections): void { }

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void { }

  private setStylesForOtherScreens(style: any): PebElementStyling {
    for (const prop of Object.keys(style)) {
      const value = style[prop];
      style[prop] = {};
      for (const screen of [PebScreen.Desktop, PebScreen.Tablet, PebScreen.Mobile]) {
        if (!this.component.screenStylesFixed(screen)) {
          style[prop][screen] = value;
        }
      }
      style[prop][this.component.screen] = value;
    }

    return style;
  }
}
