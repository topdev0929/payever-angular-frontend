import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { get, isEqual } from 'lodash-es';
import { combineLatest, Subject } from 'rxjs';
import { filter, skip, take, takeUntil, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PeStepperService, PeWelcomeStepperAction } from '@pe/stepper';
import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

import { DEFAULT_SNACK_BAR_DURATION, STATUS_FORBIDDEN } from '../../../shared/constants';
import { SectionsService } from '../../services';
import { EnvService } from '../../../shared/services/env.service';
import { Business } from '../../../shared/interfaces/business.interface';
import { LinkControlInterface, TextControlInterface } from '../../../shared/interfaces/editor.interface';
import { NavbarControlPosition, NavbarControlType } from '../../../shared/enums/editor.enum';
import { AbstractComponent } from '../../../misc/abstract.component';
import { CurrencyService } from '../../../shared/services/currency.service';
import { Category, ExternalError, VariantsSection } from '../../../shared/interfaces/section.interface';
import { ProductEditorSections, ProductTypes } from '../../../shared/enums/product.enum';
import { DialogService } from '../../../products-list/services/dialog-data.service';
import { ProductModel } from '../../../shared/interfaces/product.interface';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pf-products-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent extends AbstractComponent implements OnInit {
  @ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>;

  theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  isEdit: boolean;
  business: Business;
  channelSetId: number;
  externalError$: Subject<ExternalError> = new Subject<ExternalError>();
  ratesList: any[];

  titleControlConfig: TextControlInterface = {
    position: NavbarControlPosition.Center,
    type: NavbarControlType.Text,
    text: this.translateService.translate('title'),
  };
  linkControlConfig: LinkControlInterface = {
    position: NavbarControlPosition.Right,
    type: NavbarControlType.Link,
    text: this.translateService.translate('save'),
    classes: 'mat-button-fit-content',
    queryParams: this.route.snapshot.queryParams, // to prevent removing of get params
    onClick: () => {
      this.sectionsService.save().pipe(filter((valid: boolean) => !!valid), takeUntil(this.destroyed$)).subscribe(
        () => this.handleSave(),
        (error: any) => this.handleError(error),
      );
    },
  };

  modalHeaderControls: Array<TextControlInterface | LinkControlInterface> = [
    this.titleControlConfig,
    this.linkControlConfig,
  ];

  private model: ProductModel;

  constructor(
    private currencyService: CurrencyService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    public sectionsService: SectionsService,
    private peStepperService: PeStepperService,
    private cdr: ChangeDetectorRef,
    public confirmDialog: DialogService,
    private pebEnvService: PebEnvService,
  ) {
    super();
  }

  get activeSection(): ProductEditorSections {
    return this.sectionsService.activeSection;
  }

  ngOnInit(): void {
    this.channelSetId = this.route.snapshot.params.channelId;
    this.ratesList = this.route.snapshot.data.vatRates;
    this.model = JSON.parse(this.route.snapshot.queryParamMap.get('products'));
    if (this.model) {
      this.sectionsService.setProduct(this.model);
    }
    const isEdit: boolean = this.route.snapshot.data.isProductEdit;
    this.isEdit = isEdit;
    this.sectionsService.isEdit = isEdit;
    const needToSetLoadedProduct: boolean = isEdit && this.sectionsService.resetState$.value;

    if (needToSetLoadedProduct) {
      this.sectionsService.setProduct(get(this.route.snapshot, ['data', 'product', 'data', 'product'], null));
      this.currencyService.currency =
        get(this.route.snapshot, ['data', 'product', 'data', 'product', 'currency'], null);
    }

    this.sectionsService.sectionKeys = this.filterSectionKeys(
      this.sectionsService.variantsSection, this.sectionsService.model.onSales,
    );

    combineLatest([
      this.sectionsService.variantsChange$,
      this.sectionsService.mainSectionChange$,
      this.sectionsService.productType$,
    ]).pipe(
      filter(d => !!d && !!d[1]),
      takeUntil(this.destroyed$),
    ).subscribe(([variantsData, mainSectionData, productType]) => {
      this.sectionsService.sectionKeys = this.filterSectionKeys(
        variantsData,
        mainSectionData && mainSectionData.onSales,
        productType,
      );
      this.cdr.markForCheck();
    });

    this.sectionsService.isUpdating$.subscribe((isUpdating) => {
      this.modalHeaderControls = [
        this.titleControlConfig,
        {
          ...this.linkControlConfig,
          loading: isUpdating,
        },
      ];
      this.cdr.markForCheck();
    });

    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowGoBack, true);

    if (isEdit) {
      this.model = get(this.route.snapshot, ['data', 'product', 'data', 'product'], null);
      this.model.available = this.sectionsService.model.available ?? false;
      this.model.inventoryTrackingEnabled = this.model.inventoryTrackingEnabled ?? false;
      this.model.inventory = this.model.inventory ?? 0;
      this.model.productType = this.model.type;
      this.model.categories = this.model.categories.map(category => {
        return { title: category.title };
      });

      this.sectionsService.recommendations$.pipe(
        skip(1),
        tap(recommendations => {
          if (recommendations) {
            this.model.recommendations = recommendations;
          }
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  close() {
    if (isEqual(this.model, this.sectionsService.model)) {
      this.navigateToList();
    } else {
      this.confirmDialog.open({
        title: this.isEdit
          ? this.translateService.translate('dialog_leave.heading_editing')
          : this.translateService.translate('dialog_leave.heading_adding'),
        subtitle: this.isEdit
          ? this.translateService.translate('dialog_leave.description_editing')
          : this.translateService.translate('dialog_leave.description_adding'),
        confirmBtnText: this.translateService.translate('dialog_leave.yes'),
        declineBtnText: this.translateService.translate('dialog_leave.no'),
      });

      this.confirmDialog.confirmation$.pipe(
        skip(1),
        take(2),
      ).subscribe(() => {
        this.navigateToList();
      });
    }
  }

  navigateToList() {
    this.sectionsService.resetState$.next(true);
    const prevPath: string = this.route.snapshot.queryParams.prevProductsPath || 'list';
    const url = ['business', this.envService.businessUuid, 'products', prevPath, { outlets: { editor: null } }];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }

  done() {
    this.sectionsService.save().pipe(
      tap((valid: boolean) => {
        if (!valid) {
          this.pannels.forEach((panel: any, index: number) => {
            if (this.hasErrors(this.sectionsService.sectionKeys[index])) {
              panel.open();
            } else {
              panel.close();
            }
          });
        }
      }),
      filter((valid: boolean) => !!valid),
      takeUntil(this.destroyed$),
    ).subscribe(
      () => this.handleSave(),
      (error: any) => this.handleError(error),
    );
  }

  hasErrors(section: ProductEditorSections): boolean {
    return this.sectionsService.hasErrors(section);
  }

  setStep(step: ProductEditorSections): void {
    this.sectionsService.activeSection = step;
    this.sectionsService.activeSection$.next(step);
  }

  removeStep(section: ProductEditorSections): void {
    if (this.sectionsService.activeSection === section) {
      this.sectionsService.activeSection = null;
      this.sectionsService.activeSection$.next(null);
    }
  }

  handleError(err: any): void {
    if (!err.graphQLErrors) {
      return;
    }
    const error = err.graphQLErrors[0];
    const message: string = error.message || String(error);
    if (message === 'This value is already used' || message === 'Product with sku already exists') {
      // TODO Rework to automatic get section from error
      this.externalError$.next({
        section: ProductEditorSections.Inventory,
        field: 'sku',
        errorText: message,
      });
    } else {
      this.snackBarService.toggle(
        true,
        {
          content: error?.statusCode === STATUS_FORBIDDEN ?
            this.translateService.translate('errors.forbidden') : message,
          duration: DEFAULT_SNACK_BAR_DURATION,
          iconId: 'icon-x-rounded-16',
          iconSize: 20,
        },
      );
    }
  }

  handleSave(): void {
    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowGoBack, false);
    this.snackBarService.toggle(
      true,
      {
        content: this.sectionsService.model.id ?
          this.translateService.translate('products.edited') :
          this.translateService.translate('products.saved'),
        duration: DEFAULT_SNACK_BAR_DURATION,
        iconId: 'icon-check-rounded-16',
        iconSize: 20,
      });
    const isProductNotForChannel: boolean = this.route.snapshot.queryParams.prevProductsPath === 'select-products';
    this.sectionsService.resetState$.next(true);
    if (isProductNotForChannel) {
      const url: string[] = ['business', this.envService.businessUuid, 'products', 'select-products'];
      this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    } else {
      const url = ['business', this.envService.businessUuid, 'products', 'list', { outlets: { editor: null } }];
      this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    }
  }

  getDescription(key: ProductEditorSections): string {
    switch (key) {
      case ProductEditorSections.Category: {
        return this.sectionsService.categorySection.categories
          .map((category: Category) => category && category.title).join(', ');
      }
      case ProductEditorSections.Variants: {
        const variantsCount: number = this.sectionsService.variantsSection ?
          this.sectionsService.variantsSection.length : 0;
        return `${variantsCount}
        ${this.translateService.translate('sections.variants').toLocaleLowerCase()}`;
      }
      case ProductEditorSections.Channels: {
        return '';
      }
      case ProductEditorSections.Recommendations: {
        return '';
      }
      case ProductEditorSections.Shipping: {
        const separator = ' *';
        const start = '(';
        const end = ')';
        if (this.sectionsService.productType === ProductTypes.Physical) {
          return `${this.sectionsService.shippingSection.weight ? this.sectionsService.shippingSection.weight : ''}
          ${this.sectionsService.shippingSection.weight ?
            this.translateService.translate('shippingSection.measure.kg').toLocaleLowerCase() : ''}
          ${this.sectionsService.shippingSection.width ? start + this.sectionsService.shippingSection.width + separator : ''}
          ${this.sectionsService.shippingSection.length ? this.sectionsService.shippingSection.length + separator : ''}
          ${this.sectionsService.shippingSection.height ? this.sectionsService.shippingSection.height + end : ''}`;
        }
        break;
      }
      case ProductEditorSections.Taxes: {
        const selectedVatRate = this.ratesList.find(({ rate }) => rate === this.sectionsService.taxesSection.vatRate) ||
          this.ratesList[0];
        const label = `${selectedVatRate.description} - ${selectedVatRate.rate}%`;
        return label;
      }
      default:
        return '';
    }
  }

  getDescriptionIcons(): string[] {
    return this.sectionsService.channelsGroups
      .map(channelDesc => channelDesc.icon);
  }

  private filterSectionKeys(currentVariants: VariantsSection[], onSales: boolean, type?: ProductTypes)
    : ProductEditorSections[] {
    return Object.values(ProductEditorSections)
      .filter(section => {
        if (section === ProductEditorSections.Inventory) {
          // Inventory section disappears when we have variants
          return !(currentVariants && currentVariants.length);
        } else if (section === ProductEditorSections.Shipping) {
          // Hide shipping section if item is not physical
          return type ? type === ProductTypes.Physical : true;
        }

        return true;
      });
  }


}
