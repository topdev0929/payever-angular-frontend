// tslint:disable:max-file-line-count
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { assign, cloneDeep, find as _find, findIndex, get, isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject, timer } from 'rxjs';
import { filter, map, mergeMap, skip, switchMap, take } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import {
  AttributesSection,
  Category,
  CategorySection,
  ChannelsSection,
  ContentSection,
  InventorySection,
  MainSection,
  NotFullCategory,
  RecommendationsSection,
  ShippingSection,
  TaxesSection,
  VariantsSection,
  VisibilitySection,
} from '../../shared/interfaces/section.interface';
import { RecurringBillingFormInterface, RecurringBillingInterface } from '../../shared/interfaces/billing.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { EnvService } from '../../shared/services/env.service';
import { ChannelSetInterface } from '../../shared/interfaces/channel-set.interface';
import { ProductModel } from '../../shared/interfaces/product.interface';
import { ApiBuilderService } from './api-builder.service';
import { PeChannelGroup } from '../../shared/interfaces/channel-group.interface';
import { ProductEditorSections, ProductTypes } from '../../shared/enums/product.enum';
import { RecommendationsInterface } from '../../shared/interfaces/recommendations.interface';
import { DataGridService } from '../../products-list/services/data-grid/data-grid.service';

import { v4 as uuid } from 'uuid';

@Injectable()
export class SectionsService {
  resetState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isUpdating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  saveClicked$: Subject<ProductEditorSections | string> = new Subject<ProductEditorSections | string>();
  saveClickedSuccess$: Subject<boolean> = new Subject<boolean>();
  variantsChange$: Subject<VariantsSection[]> = new BehaviorSubject<VariantsSection[]>(null);
  mainSectionChange$: Subject<MainSection> = new BehaviorSubject<MainSection>(null);
  recommendations$: Subject<RecommendationsInterface> = new BehaviorSubject<RecommendationsInterface>(null);
  recurringBillingChange$: Subject<RecurringBillingFormInterface> = new BehaviorSubject<RecurringBillingFormInterface>(
    null,
  );
  isSubmitted = false;
  isEdit: boolean;
  channelsGroups: PeChannelGroup[] = [];

  sectionKeys: ProductEditorSections[] = Object.keys(ProductEditorSections).map(
    (key: string) => ProductEditorSections[key],
  );
  activeSection: ProductEditorSections = ProductEditorSections.Main;
  activeSection$: Subject<ProductEditorSections> = new Subject<ProductEditorSections>();
  sectionsWithErrors: string[] = [];
  allCategories: Category[];
  allRecommendations: RecommendationsInterface[] = [];
  model: ProductModel = cloneDeep(ProductsApiService.model);
  recurringBillingLoading$ = new BehaviorSubject(false);
  recurringBillingInitial: RecurringBillingInterface = {};
  recurringBilling: RecurringBillingInterface = {};

  private productTypeBackingField$: BehaviorSubject<ProductTypes> = new BehaviorSubject<ProductTypes>(null);


  constructor(
    private api: ProductsApiService,
    private apiBuilder: ApiBuilderService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private envService: EnvService,
    private dataGridService: DataGridService,
  ) {
    this.resetState$.pipe(skip(1), filter(Boolean)).subscribe(() => {
      this.resetState();
    });
  }

  get productType(): ProductTypes {
    return get(this.model, 'type', ProductTypes.Physical);
  }

  get productType$(): Subject<ProductTypes> {
    return this.productTypeBackingField$;
  }

  get mainSection(): MainSection {
    return {
      images: get(this.model, 'images', ProductsApiService.model.images),
      title: get(this.model, 'title', ProductsApiService.model.title),
      price: get(this.model, 'price', ProductsApiService.model.price),
      available: get(this.model, 'available', ProductsApiService.model.available),
      onSales: get(this.model, 'onSales', ProductsApiService.model.onSales),
      salePrice: get(this.model, 'salePrice', ProductsApiService.model.salePrice),
      productType: this.productType,
    };
  }

  get contentSection(): ContentSection {
    return {
      description: get(this.model, 'description', ProductsApiService.model.description),
    };
  }

  get inventorySection(): InventorySection {
    return {
      sku: get(this.model, 'sku', ProductsApiService.model.sku),
      barcode: get(this.model, 'barcode', ProductsApiService.model.barcode),
      inventory: get(this.model, 'inventory', ProductsApiService.model.inventory),
      inventoryTrackingEnabled: get(
        this.model,
        'inventoryTrackingEnabled',
        ProductsApiService.model.inventoryTrackingEnabled,
      ),
    };
  }

  get categorySection(): CategorySection {
    return {
      categories:
        get(this.model, 'categories', ProductsApiService.model.categories) || ProductsApiService.model.categories,
    };
  }

  get channelsSection(): ChannelsSection[] {
    return get(this.model, 'channelSets', []);
  }

  get recommendationsSection(): RecommendationsSection {
    return {
      allowRecommendations: get(this.model, 'recommendations.tag', false) ? true : false,
      recommendationTag: get(this.model, 'recommendations.tag'),
      currentRecommendations: get(this.model, 'recommendations.recommendations', []),
    };
  }

  get taxesSection(): TaxesSection {
    return {
      vatRate: get(this.model, 'vatRate', null),
    };
  }

  get visibilitySection(): { active: boolean } {
    const channelSetId: string = this.route.snapshot.queryParams.channelSet;
    let active: boolean;
    if (channelSetId) {
      active = get(
        _find(get(this.model, 'channelSets', []), (channelSet: ChannelSetInterface) => channelSet.id === channelSetId),
        'active',
        true,
      );
      active = active === null ? true : active; // not migrated product
    } else {
      active = get(this.model, 'active', true);
      active = active === null ? true : active; // not migrated product
    }

    return {
      active,
    };
  }

  isRecurringBillingAvailable(): boolean {
    return this.recurringBilling.installed;
  }

  get variantsSection(): VariantsSection[] {
    return get(this.model, 'variants', []);
  }

  get attributesSection(): AttributesSection[] {
    return get(this.model, 'attributes', []);
  }

  get shippingSection(): ShippingSection {
    return {
      weight: this.model.shipping?.weight ?? '0.00',
      width: this.model.shipping?.width ?? '0.00',
      length: this.model.shipping?.length ?? '0.00',
      height: this.model.shipping?.height ?? '0.00',
    };
  }

  onChangeProductType(type: ProductTypes): void {
    if (type !== ProductTypes.Physical) {
      this.resetSectionErrors(ProductEditorSections.Shipping);
    }
    this.productTypeBackingField$.next(type);
    this.model.productType = type;
  }

  onChangeMainSection(mainSection: MainSection): void {
    this.model.images = mainSection.images;
    this.model.title = mainSection.title;
    this.model.price = mainSection.price;
    this.model.salePrice = mainSection.salePrice;
    this.model.onSales = mainSection.onSales;
    this.onChangeProductType(mainSection.productType);
    this.mainSectionChange$.next(mainSection);
  }

  onChangeContentSection(contentSection: ContentSection): void {
    this.model.description = contentSection.description;
  }

  onChangeInventorySection(inventorySection: InventorySection): void {
    this.model.sku = inventorySection.sku;
    this.model.barcode = inventorySection.barcode;
    this.model.inventory = inventorySection.inventory || 0;
    this.model.inventoryTrackingEnabled = inventorySection.inventoryTrackingEnabled || false;
  }

  onChangeCategorySection(categorySection: { categories: NotFullCategory[] }): void {
    this.model.categories = categorySection.categories;
  }

  prepareCategories(): void {
    this.model.categories = (this.model.categories.reduce((acc, notFullCategory: NotFullCategory) => {
      const category = this.allCategories.find((fullCategory: Category) => {
        return notFullCategory.title === fullCategory.title;
      });

      if (category) {
        acc.push(category);
      }

      return acc;
    }, []) as Category[]);
  }

  onChangeChannelsSection(marketplacesSection: ChannelsSection, isChecked: boolean): void {
    if (isChecked) {
      this.model.channelSets.push(marketplacesSection);
    } else {
      this.model.channelSets = this.model.channelSets.filter(
        (marketplace: ChannelsSection) => marketplace.id !== marketplacesSection.id,
      );
    }
  }

  onChangeTaxesSection(taxes: TaxesSection): void {
    this.model.vatRate = taxes.vatRate;
  }

  onChangeVisibilitySection(visibility: VisibilitySection): void {
    this.model.active = visibility.active;
  }

  onChangeRecurringBillingSection(data: RecurringBillingInterface): void {
    assign(this.recurringBilling, data);
    this.recurringBillingChange$.next(data);
  }

  onChangeRecommendationsSection(data: RecommendationsSection): void {
    if (!data.allowRecommendations) {
      this.model.recommendations = null;
      return;
    }

    this.model.recommendations = {
      tag: data.recommendationTag,
      recommendations: data.currentRecommendations,
    } as RecommendationsInterface;
  }

  onChangeShippingSection(shipping: ShippingSection): void {
    this.model.shipping = shipping;
  }

  getVariantAsync(variantId: string, isCreate: boolean): Observable<VariantsSection> {
    if (isCreate || !variantId) {
      return of(this.getVariantData({ id: uuid() }));
    }

    const index = this.model.variants.findIndex((item: VariantsSection) => item.id === variantId);

    if (index > -1) {
      const variantModel = this.model.variants[index];
      // If data not get from inventory DB
      if (typeof variantModel.inventory === 'undefined') {
        return this.api.getInventoryBySKU(variantModel.sku, this.envService.businessUuid).pipe(
          map(inv => {
            return this.getVariantData({
              ...variantModel,
              ...inv,
              // in case if inventory not exists yet
              inventory: inv.sku ? inv.stock : variantModel.inventory,
              // in case if inventory not exists yet
              inventoryTrackingEnabled: inv.sku ? inv.isTrackable : variantModel.inventoryTrackingEnabled,
            });
          }),
        );
      } else {
        return of(
          this.getVariantData({
            ...variantModel,
          }),
        );
      }
    } else {
      return of(this.getVariantData({ id: uuid() }));
    }
  }

  setVariant(variant: VariantsSection, isCreate: boolean): void {
    const modelVariant: any = cloneDeep(variant);
    modelVariant.inventory = parseInt(modelVariant.inventory, 10);

    if (isCreate) {
      modelVariant.price = this.model.price || 0;
      if (this.model.sku) {
        let sku: string;
        let variantNumber = this.model.variants.length + 1;
        do {
          sku = `${this.model.sku}-${variantNumber}`;
          variantNumber++;
        } while (this.model.variants.some(variantModel => variantModel.sku === sku));
        modelVariant.sku = sku;
      }
      this.model.variants.push(modelVariant);
    } else {
      const index: number = findIndex(this.model.variants, (item: VariantsSection) => item.id === variant.id);
      this.model.variants[index] = modelVariant;
    }
  }

  onChangeAttributesSection(attributes: AttributesSection[]): void {
    this.model.attributes = attributes;
  }

  removeVariant(id: string): void {
    this.model.variants = this.model.variants.filter((variant: VariantsSection) => variant.id !== id);
    this.variantsChange$.next(this.model.variants);
  }

  onNextStepMove(): void {
    this.activeSection = this.sectionKeys[this.sectionKeys.indexOf(this.activeSection) + 1];
  }

  // create product
  save(): Observable<boolean> {
    if (this.recurringBillingLoading$.getValue()) {
      this.snackBarService.toggle(
        true,
        {
          content: this.translateService.translate('errors.billingSubscriptionsNotLoadedBeforeSave'),
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        });
      return of(false);
    }

    this.saveClicked$.next(this.activeSection);
    const businessUuid: string = this.envService.businessUuid;
    const id: string = get(this.model, 'id', null);
    this.isSubmitted = true;
    if (id === null) {
      this.saveClicked$.next(this.activeSection);
    }
    if (this.sectionsWithErrors.length === 0) {
      this.saveClickedSuccess$.next(true);

      return this.api
        .createProduct(
          {
            id,
            images: this.model.images,
            title: this.model.title,
            company: this.envService.business.name,
            description: this.getNormalizedDescription(),
            onSales: this.model.onSales,
            price: this.model.price,
            recommendations: this.model.recommendations,
            salePrice: this.model.salePrice,
            vatRate: this.model.vatRate,
            collections: this.model.collections,
            sku: this.model.sku,
            inventory: this.model.inventory,
            inventoryTrackingEnabled: this.model.inventoryTrackingEnabled,
            barcode: this.model.barcode,
            categories: this.model.categories,
            type: this.model.productType,
            channelSets: this.getChannelSets(),
            active: this.model.active,
            variants: this.model.variants,
            attributes: this.model.attributes,
            shipping: this.model.shipping,
          } as any,
          businessUuid,
        )
        .pipe(
          switchMap(createdProduct => {
            // Processing Recurring Billing
            const productId: string = id || get(createdProduct, 'data.createProduct.id');
            const collectionId = this.dataGridService.selectedFolder;

            if (!this.isEdit && collectionId) {
              this.api.addProductsToCollection(collectionId, [productId], this.envService.businessUuid)
                .pipe(take(1)).subscribe();
            }

            let request: Observable<any> = of(null);
            if (this.recurringBilling.url && !isEqual(this.recurringBillingInitial, this.recurringBilling)) {
              if (this.recurringBillingInitial.enabled && !this.recurringBilling.enabled) {
                request = this.api.removeBillingIntegrationProduct(this.recurringBilling.url, businessUuid, productId);
              } else if (this.recurringBilling.enabled && !this.recurringBillingInitial.enabled) {
                request = this.api.addBillingIntegrationProduct(this.recurringBilling.url, businessUuid, {
                  _id: productId,
                  title: this.model.title,
                  price: this.model.price,
                  interval: this.recurringBilling.interval,
                  billingPeriod: Number(this.recurringBilling.billingPeriod),
                });
              } else if (this.recurringBilling.enabled) {
                request = this.api.editBillingIntegrationProduct(this.recurringBilling.url, businessUuid, productId, {
                  interval: this.recurringBilling.interval,
                  billingPeriod: Number(this.recurringBilling.billingPeriod),
                });
              }
            }
            return request.pipe(
              map((response) => {
                this.setRecurringBilling(this.recurringBilling);
                this.dataGridService.updateGrid('product');
                return of(createdProduct);
              }),
            );
          }),
          mergeMap(createdProduct => {
            const isNewProductForWidget: boolean =
              this.route.snapshot.queryParams.widgetId && this.router.url.indexOf('products-editor') !== -1;
            if (isNewProductForWidget) {
              const productId: string = get(createdProduct, 'data.createProduct.id');
              return this.apiBuilder.patchWidgetProducts(productId, businessUuid);
            } else {
              return of(createdProduct);
            }
          }),
        );
    } else {
      return of(false);
    }
  }

  hasErrors(section: ProductEditorSections): boolean {
    return this.sectionsWithErrors.indexOf(section) !== -1;
  }

  onFindError(hasErrors: boolean, section: ProductEditorSections): void {
    if (hasErrors) {
      if (!this.hasErrors(section)) {
        this.sectionsWithErrors.push(section);
      }
    } else {
      if (this.hasErrors(section)) {
        this.sectionsWithErrors.splice(this.sectionsWithErrors.indexOf(section), 1);
      }
    }
  }

  setProduct(product: ProductModel): void {
    this.model = Object.assign({}, this.model, product);
    this.variantsChange$.next(this.model.variants);
  }

  setRecurringBilling(recurringBilling: RecurringBillingInterface): void {
    this.recurringBilling = Object.assign({}, this.recurringBilling, recurringBilling);
    this.recurringBillingInitial = cloneDeep(this.recurringBilling);
  }

  setRecurringBillingLoading(loading: boolean): void {
    this.recurringBillingLoading$.next(loading);
  }

  isSkuUniqAsync(currentSKU?: string): AsyncValidatorFn {
    const businessUuid: string = this.envService.businessUuid;
    const id: string = get(this.model, 'id', null);
    const CHECK_TIMEOUT = 1000;

    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return timer(CHECK_TIMEOUT).pipe(
        switchMap(() => {
          if (currentSKU === control.value) {
            return of(null);
          } else {
            const error = {
              external: this.translateService.translate('mainSection.form.errors.sku'),
            };

            if (this.model.variants.some(variant => variant.sku === control.value)) {
              return of(error);
            } else {
              return this.api.isSkuUsed(control.value, businessUuid, id).pipe(
                map(result => {
                  if (result) {
                    return error;
                  }
                }),
              );
            }
          }
        }),
      );
    };
  }

  private getNormalizedDescription(): string {
    return this.model.description.replace(/(\n)/g, '\\n').replace(/"/g, '\\"');
  }

  private getChannelSets(): ChannelSetInterface[] {
    const channelSetId: string = this.route.snapshot.queryParams.channelSet;
    const isProductForChannel: boolean = this.route.snapshot.queryParams.prevProductsPath === 'list';
    const currentChannelSet: ChannelSetInterface[] =
      channelSetId && isProductForChannel
        ? [
          {
            id: channelSetId,
            type: this.route.snapshot.queryParams.app, // TODO: Channel
            name: '1',
          },
        ]
        : null;

    const isChecked: boolean =
      this.model.channelSets &&
      this.model.channelSets.length &&
      currentChannelSet &&
      currentChannelSet.length &&
      this.model.channelSets.some((marketplace: ChannelSetInterface) => marketplace.id !== currentChannelSet[0].id);

    if (isChecked) {
      if (this.isEdit) {
        return this.model.channelSets;
      } else {
        return [...this.model.channelSets, ...currentChannelSet];
      }
    } else {
      return currentChannelSet || this.model.channelSets;
    }
  }

  private resetFields(): void {
    this.model = cloneDeep(ProductsApiService.model);
  }

  private resetActiveSection(): void {
    this.activeSection = ProductEditorSections.Main;
  }

  private resetErrors(): void {
    this.sectionsWithErrors = [];
  }

  private resetVariants(): void {
    this.variantsChange$.next([]);
  }

  private resetState(): void {
    this.resetFields();
    this.resetActiveSection();
    this.resetErrors();
    this.resetVariants();
  }

  private resetSectionErrors(resetSection: ProductEditorSections): void {
    this.sectionsWithErrors = this.sectionsWithErrors.filter(
      (section: ProductEditorSections) => section !== resetSection,
    );
  }

  private getVariantData(patch: Partial<VariantsSection>) {
    const model = {
      ...cloneDeep(ProductsApiService.model),
      ...patch,
    };

    return {
      id: model.id,
      images: model.images,
      options: model.options || [],
      description: model.description,
      price: model.price,
      available: model.available,
      onSales: model.onSales,
      salePrice: model.salePrice,
      productType: model.productType,
      sku: model.sku,
      inventory: model.inventory,
      inventoryTrackingEnabled: model.inventoryTrackingEnabled,
      barcode: model.barcode,
    };
  }
}
