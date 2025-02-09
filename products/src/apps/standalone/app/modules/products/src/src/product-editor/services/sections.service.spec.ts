// tslint:disable:no-magic-numbers

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { TranslateService } from '@pe/i18n';

import { ProductsListEnvConfigService } from '../../config';
import { ApiBuilderService } from '../../products-list/core/api-builder.service';
import { AppInstanceEnum } from '../../products-list/enums';
import { ApiService } from '../../../shared/services';
import { ProductEditorSections, ProductTypes } from '../enums';
import {
  Category,
  ChannelsSection,
  InventoryInterface,
  InventorySection,
  MainSection,
  NotFullCategory,
  ShippingSection,
  TaxesSection,
  VariantsSection,
} from '../interfaces';
import { SectionsService } from './sections.service';

import { Observable } from 'apollo-link';

describe('SectionsService', () => {
  let sectionsService: SectionsService;

  let activatedRoute: any = {};
  let router: any = {};
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let apiBuilderServiceSpy: jasmine.SpyObj<ApiBuilderService>;
  let productsListEnvConfigServiceSpy: jasmine.SpyObj<ProductsListEnvConfigService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const slug = 'test-slug';
  const defaultVariantSection: VariantsSection = {
    id: ApiService.model.id,
    images: ApiService.model.images,
    options: [],
    description: ApiService.model.description,
    price: ApiService.model.price,
    onSales: ApiService.model.onSales,
    salePrice: ApiService.model.salePrice,
    sku: ApiService.model.sku,
    inventory: ApiService.model.inventory,
    inventoryTrackingEnabled: ApiService.model.inventoryTrackingEnabled,
    barcode: ApiService.model.barcode,
  };

  function initiazlizeSpys(): void {
    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['isSkuUsed', 'getInventoryBySKU', 'createProduct']);
    apiBuilderServiceSpy = jasmine.createSpyObj<ApiBuilderService>('ApiBuilderService', ['patchWidgetProducts']);
    productsListEnvConfigServiceSpy = jasmine.createSpyObj<ProductsListEnvConfigService>('ProductsListEnvConfigService', ['getSlug']);
    translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['setTranslations', 'translate']);

    translateServiceSpy.translate.and.callFake((str: string) => str);
    productsListEnvConfigServiceSpy.getSlug.and.returnValue(slug);
    activatedRoute = { snapshot: { queryParams: {} } };
    router = { url: '' };
  }

  beforeEach(() => {
    initiazlizeSpys();

    TestBed.configureTestingModule({
      providers: [
        SectionsService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ApiBuilderService, useValue: apiBuilderServiceSpy },
        { provide: ActivatedRoute, useFactory: () => activatedRoute },
        { provide: Router, useFactory: () => router },
        { provide: ProductsListEnvConfigService, useValue: productsListEnvConfigServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });
  });

  it('should be defined', () => {
    sectionsService = TestBed.get(SectionsService);

    expect(sectionsService).toBeDefined();
  });

  it('should reset state on resetState$', () => {
    sectionsService = TestBed.get(SectionsService);

    const resetStateSpy: jasmine.Spy = spyOn<any>(sectionsService, 'resetState').and.callThrough();

    sectionsService.resetState$.next(true);
    expect(resetStateSpy).toHaveBeenCalled();
  });

  it('#productType should get product type. `ProductTypes.Physical` by default', () => {
    sectionsService = TestBed.get(SectionsService);

    expect(sectionsService.productType).toBe(ProductTypes.Physical);
  });

  it('should have properties with getters', () => {
    sectionsService = TestBed.get(SectionsService);
    const properties: string[] = [
      'productType$',
      'mainSection',
      'inventorySection',
      'categorySection',
      'channelsSection',
      'taxesSection',
      'variantsSection',
      'shippingSection',
    ];

    properties.forEach(property => {
      const spy: jasmine.Spy = spyOnProperty(sectionsService, property as any, 'get').and.callThrough();
      expect(sectionsService[property]).toBeDefined();
      expect(spy).toHaveBeenCalled();
    });
  });

  it('#visibilitySection should be based on route if channelSet is provided', () => {
    const channelSet = 'test-channel-set';
    activatedRoute.snapshot.queryParams = { channelSet };

    sectionsService = TestBed.get(SectionsService);
    const section: any = { id: channelSet, active: true };
    sectionsService.channelsSection.push(section);

    expect(sectionsService.visibilitySection.active).toBe(true);

    section.active = false;
    expect(sectionsService.visibilitySection.active).toBe(false);
  });

  it('#visibilitySection should be based on model if channelSet is not provided', () => {
    sectionsService = TestBed.get(SectionsService);

    sectionsService.onChangeVisibilitySection({ active: true });
    expect(sectionsService.visibilitySection.active).toBe(true);

    sectionsService.onChangeVisibilitySection({ active: false });
    expect(sectionsService.visibilitySection.active).toBe(false);
  });

  it('#onChangeProductType should set #productType', () => {
    const productTypes: ProductTypes[] = Object.keys(ProductTypes)
      .map(key => ProductTypes[key]);

    sectionsService = TestBed.get(SectionsService);
    const resetSectionErrorsSpy: jasmine.Spy = spyOn<any>(sectionsService, 'resetSectionErrors').and.callThrough();

    productTypes.forEach(productType => {
      sectionsService.onChangeProductType(productType);
      expect(sectionsService.productType).toBe(productType);

      if (productType !== ProductTypes.Physical) {
        expect(resetSectionErrorsSpy).toHaveBeenCalled();
      }
    });
  });

  it('#onChangeMainSection should set #mainSection', () => {
    sectionsService = TestBed.get(SectionsService);

    const mainSection: MainSection = {
      title: 'test',
      description: 'test',
      images: ['image'],
      price: 123,
      onSales: true,
      salePrice: 100,
    };
    sectionsService.onChangeMainSection(mainSection);
    expect(sectionsService.mainSection).toEqual(mainSection);
  });

  it('#onChangeInventorySection should set #inventorySection', () => {
    sectionsService = TestBed.get(SectionsService);

    const inventorySection: InventorySection = {
      barcode: 'bar',
      inventory: 123,
      inventoryTrackingEnabled: true,
      sku: 'sku',
    };
    sectionsService.onChangeInventorySection(inventorySection);
    expect(sectionsService.inventorySection).toEqual(inventorySection);
  });

  it('#onChangeCategorySection should change #categorySection', () => {
    sectionsService = TestBed.get(SectionsService);

    const categorySection: { categories: NotFullCategory[] } = {
      categories: [{ title: 'category' }],
    };
    sectionsService.onChangeCategorySection(categorySection);
    expect(sectionsService.categorySection).toEqual(categorySection);
  });

  it('#prepareCategories should update #categorySection by full categories', () => {
    sectionsService = TestBed.get(SectionsService);

    const notFullCategories: NotFullCategory[] = [
      { title: 'category 1' },
      { title: 'category 2' },
      { title: 'category 3' },
    ];
    const fullCategories: Category[] = [
      { title: 'category 1', id: '1', businessUuid: 'uuid', slug: 'slug' },
      { title: 'category 2', id: '2', businessUuid: 'uuid', slug: 'slug' },
      { title: 'category 3', id: '3', businessUuid: 'uuid', slug: 'slug' },
    ];

    sectionsService.allCategories = fullCategories;

    sectionsService.onChangeCategorySection({ categories: notFullCategories });
    expect(sectionsService.categorySection).toEqual({ categories: notFullCategories });

    sectionsService.prepareCategories();
    expect(sectionsService.categorySection).toEqual({ categories: fullCategories });
  });

  it('#onChangeTaxesSection should set #TaxesSection', () => {
    sectionsService = TestBed.get(SectionsService);

    const taxesSection: TaxesSection = {
      vatRate: 2,
    };
    sectionsService.onChangeTaxesSection(taxesSection);
    expect(sectionsService.taxesSection).toEqual(taxesSection);
  });

  it('#onChangeShippingSection should set #shippingSection', () => {
    sectionsService = TestBed.get(SectionsService);

    const shippingSection: ShippingSection = {
      height: '1cm',
      length: '1cm',
      width: '1cm',
      weight: '1kg',
    };
    sectionsService.onChangeShippingSection(shippingSection);
    expect(sectionsService.shippingSection).toEqual(shippingSection);
  });

  it('#onChangeChannelsSection should update channelSets', () => {
    sectionsService = TestBed.get(SectionsService);

    const channelSection: ChannelsSection = { id: 'section', type: AppInstanceEnum.Shop, enabled: true };

    sectionsService.onChangeChannelsSection(channelSection, true);
    expect(sectionsService.channelsSection).toEqual([channelSection]);

    sectionsService.onChangeChannelsSection(channelSection, false);
    expect(sectionsService.channelsSection).toEqual([]);
  });

  it('#getVariantAsync should get variant section observable', () => {
    const customVariantSection: VariantsSection = {
      ...defaultVariantSection,
    };
    customVariantSection.id = 'customId';
    customVariantSection.inventory = 10;

    sectionsService = TestBed.get(SectionsService);
    sectionsService.setVariant(customVariantSection, true);

    sectionsService.getVariantAsync(customVariantSection.id, false).subscribe(variant => {
      expect(variant).toEqual(customVariantSection);
    });
  });

  it('#getVariantAsync should call to API if model inventory is not defined', () => {
    const inventory: InventoryInterface = {
      sku: 'sku',
      stock: 10,
      isTrackable: true,
    } as InventoryInterface;
    const customVariantSection: VariantsSection = {
      ...defaultVariantSection,
      sku: 'sku',
    };
    customVariantSection.id = 'customId';
    customVariantSection.inventory = undefined;

    apiServiceSpy.getInventoryBySKU.and.returnValue(of(inventory));
    sectionsService = TestBed.get(SectionsService);
    sectionsService.model.variants.push(customVariantSection);

    sectionsService.getVariantAsync(customVariantSection.id, false).subscribe(variant => {
      delete variant.stock; // TODO: make sure it is not required and cleanup in source code
      delete variant.isTrackable; // TODO: make sure it is not required and cleanup in source code

      expect(variant).toEqual({
        ...customVariantSection,
        inventory: inventory.stock,
        inventoryTrackingEnabled: inventory.isTrackable,
      });
    });
  });

  it('#getVariantAsync should return observable with default variant if variantId is undefined', () => {
    sectionsService = TestBed.get(SectionsService);

    sectionsService.getVariantAsync(undefined, false).subscribe(variant => {
      expect(variant).toBeDefined();
    });
  });

  it('#getVariantAsync should return observable with default variant if is just created', () => {
    sectionsService = TestBed.get(SectionsService);

    sectionsService.getVariantAsync(defaultVariantSection.id, true).subscribe(variant => {
      expect(variant).toBeDefined();
    });
  });


  it('#setVariant should set or add variant', () => {
    sectionsService = TestBed.get(SectionsService);

    const variantSection: VariantsSection = {
      ...defaultVariantSection,
    };
    variantSection.id = 'customId';

    sectionsService.setVariant(variantSection, true);
    sectionsService.getVariantAsync(variantSection.id, false).subscribe(variant => {
      expect(variant).toEqual(variantSection);
    });

    const updatedVariantSection: VariantsSection = {
      ...variantSection,
    };
    updatedVariantSection.description = 'updated description';

    expect(updatedVariantSection).not.toEqual(variantSection);
    sectionsService.setVariant(updatedVariantSection, false);
    sectionsService.getVariantAsync(updatedVariantSection.id, false).subscribe(variant => {
      expect(variant).toEqual(updatedVariantSection);
    });
  });

  it('#removeVariant should remove variant', () => {
    const customVariantSection: VariantsSection = {
      ...defaultVariantSection,
    };
    customVariantSection.id = 'customId';
    customVariantSection.onSales = true;

    sectionsService = TestBed.get(SectionsService);
    sectionsService.setVariant(customVariantSection, true);
    sectionsService.getVariantAsync(customVariantSection.id, false).subscribe(variant => {
      expect(variant).toEqual(customVariantSection);
    });

    sectionsService.removeVariant(customVariantSection.id);
    sectionsService.getVariantAsync(customVariantSection.id, false).subscribe(variant => {
      expect(variant).not.toEqual(customVariantSection);
    });
  });

  it('#onNextStepMove should change activeSection', () => {
    const sectionKeys: ProductEditorSections[] = Object.keys(ProductEditorSections).map((key: string) => ProductEditorSections[key]);
    sectionsService = TestBed.get(SectionsService);

    for (let i = 0, ic: number = sectionKeys.length - 2; i < ic; i++) {
      sectionsService.activeSection = sectionKeys[i];
      sectionsService.onNextStepMove();
      expect(sectionsService.activeSection).toBe(sectionKeys[i + 1]);
    }
  });

  it('#onFindError should update errors to inticate error presence', () => {
    const sectionKeys: ProductEditorSections[] = Object.keys(ProductEditorSections).map((key: string) => ProductEditorSections[key]);
    sectionsService = TestBed.get(SectionsService);

    sectionKeys.forEach(productSection => {
      sectionsService.onFindError(true, productSection);
      expect(sectionsService.hasErrors(productSection)).toBe(true);
    });

    sectionKeys.forEach(productSection => {
      sectionsService.onFindError(false, productSection);
      expect(sectionsService.hasErrors(productSection)).toBe(false);
    });
  });

  it('#isSkuUniqAsync should return asyncronous validation founction', fakeAsync(() => {
    sectionsService = TestBed.get(SectionsService);

    apiServiceSpy.isSkuUsed.and.returnValue(of(true));

    const sku = 'test-sku';
    const validatorFn: AsyncValidatorFn = sectionsService.isSkuUniqAsync(sku);

    const validator: unknown = validatorFn({ value: sku } as AbstractControl);
    if (validator instanceof Observable) {
      validator.subscribe(result => {
        expect(result).toBe(null);
      });
      tick(1000);
    }
    const translation = 'translated';
    translateServiceSpy.translate.and.returnValue(translation);
    const validator2: unknown = validatorFn({ value: 'different' } as AbstractControl);
    if (validator2 instanceof Observable) {
      validator2.subscribe(result => {
        expect(result).toEqual({ external: translation });
      });
      tick(1000);
    }

    it('#save should fail if there are validation errors', () => {
      sectionsService = TestBed.get(SectionsService);

      sectionsService.onFindError(true, ProductEditorSections.Category);
      expect(sectionsService.hasErrors(ProductEditorSections.Category)).toBe(true);

      sectionsService.save().subscribe(saveResult => {
        expect(saveResult).toBe(false);
      });

    });

    it('#save should create product', fakeAsync(() => {
      sectionsService = TestBed.get(SectionsService);

      const product: any = {};

      apiServiceSpy.createProduct.and.returnValue(of(product));
      apiBuilderServiceSpy.patchWidgetProducts.and.returnValue(of(true));
      activatedRoute.snapshot.queryParams.widgetId = 321;
      router.url = 'products/products-editor';


      // const isNewProductForWidget: boolean = this.route.snapshot.queryParams['widgetId']
      //           && this.router.url.indexOf('products-editor') !== -1;
      //         if (isNewProductForWidget) {
      //           const productId: string = get(createdProduct, 'data.createProduct._id');
      //           return this.apiBuilder.patchWidgetProducts(productId, businessUuid);
      //         } else {
      //           return of(createdProduct);
      //         }

      sectionsService.save().subscribe(saveResult => {
        expect(saveResult).toBe(true);
      });

    }));

    it('#save should create product and return it as an observale', () => {
      sectionsService = TestBed.get(SectionsService);

      let createdProduct: any = {};

      apiServiceSpy.createProduct.and.callFake((product: any) => {
        createdProduct = product;
        return of(createdProduct);
      });
      activatedRoute.snapshot.queryParams.widgetId = null;
      router.url = 'products/products-editor';


      sectionsService.save().subscribe(saveResult => {
        expect(saveResult).toBe(createdProduct);
      });

    });
  });
