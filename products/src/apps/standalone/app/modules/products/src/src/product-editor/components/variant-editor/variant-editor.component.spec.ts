import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { of, Subject } from 'rxjs';

import { DateAdapterInterface, ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { DEFAULT_DEV_I18N_PATH, I18nModule, LANG, LocaleConstantsService, TranslateService, TranslationTemplateArgs } from '@pe/i18n';
import { CommonModule } from '@pe/common';
import { FORM_DATE_ADAPTER } from '@pe/forms';

import { ProductsListEnvConfigService } from '../../../config';
import { SubmicroHeaderService } from '../../../../shared/services/submicro-header.service';
import { ProductEditorSections } from '../../enums';
import { Model, VariantsSection } from '../../interfaces';
import { SectionsService } from '../../services';
import { initialState } from '../../store/variant.reducer';
import { getLoaded, getVariant, VariantState } from '../../store/variant.selectors';
import { VariantEditorComponent } from './variant-editor.component';

import { MemoizedSelector, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

class MockElementRef extends ElementRef {
  constructor() { super(null); }
}

describe('VariantEditorComponent', () => {
  const mockedSelectorId = 'mockedSelectorId';

  let fixture;
  let component: VariantEditorComponent;

  let store: MockStore<VariantState>;
  let getVariantMock: MemoizedSelector<VariantState, VariantsSection>;
  let getLoadedMock: MemoizedSelector<VariantState, boolean>;

  let routerSpy: jasmine.SpyObj<Router>;
  let listEnvServiceSpy: jasmine.SpyObj<ProductsListEnvConfigService>;

  let sectionsServiceMock: SectionsService;
  let sessionStorageMock: SessionStorageService;
  let activatedRouteMock: ActivatedRoute;
  let submicroHeaderServiceMock: SubmicroHeaderService;
  let formDateAdapterMock: DateAdapterInterface;
  let translateServiceMock: TranslateService;
  let headerCloseCallback: () => void;

  let variantId: string;
  let variantsSection: VariantsSection;
  let product: Model;

  beforeEach(() => {
    variantId = 'test-variant-id';

    product = {
      id: 'productId',
      barcode: 'barcode',
      description: 'description',
      sku: 'sku',
    } as any;

    variantsSection = {
      id: 'v-id',
      options: [],
      description: 'description',
      price: 123,
      salePrice: 100,
      onSales: true,
      sku: 'sku',
      inventory: 10,
      inventoryTrackingEnabled: false,
      barcode: 'barcode',
      images: [],
    };

    translateServiceMock = {
      translate: (key: string, args?: TranslationTemplateArgs) => key,
    } as TranslateService;

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    listEnvServiceSpy = jasmine.createSpyObj<ProductsListEnvConfigService>('ProductsListEnvConfigService', ['getSlug']);

    sectionsServiceMock = {
      removeVariant: () => true,
      onFindError: jasmine.createSpy(),
      onChangeInventorySection: jasmine.createSpy(),
      getVariantAsync: (_: string) => of(variantsSection),
      isSkuUniqAsync: (_: string) => () => of(null),
      setVariant: jasmine.createSpy(),
      setProduct: jasmine.createSpy(),
      saveClicked$: new Subject<ProductEditorSections | string>(),
      variantsChange$: new Subject<VariantsSection[]>(),
      resetState$: new Subject<boolean>(),
      variantsSection: [],
      inventorySection: {
        sku: 'sku',
        barcode: 'barcode',
        inventory: 10,
        inventoryTrackingEnabled: false,
      },
    } as any;
    sessionStorageMock = {
      store: () => { return; },
      retrieve: () => ({}),
    } as any;
    activatedRouteMock = {
      snapshot: {
        queryParams: {},
        params: { variantId },
        data: {
          isVariantEdit: true,
          product: { data: { product } },
        },
      },
    } as any;
    submicroHeaderServiceMock = {
      appendShortHeader: (pageTitle: string, onCloseCallback: () => void) => {
        headerCloseCallback = onCloseCallback;
        return;
      },
    } as any;
    formDateAdapterMock = {
      format: (date: Date) => date.toISOString(),
      parse: (value: string) => new Date(value),
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
        NoopAnimationsModule,
        I18nModule,

        MatExpansionModule,
      ],
      providers: [
        ChangeDetectorRef,

        { provide: LANG, useValue: 'en' },
        {
          provide: LocaleConstantsService, useValue: new LocaleConstantsService({
            isProd: false,
            i18nPath: DEFAULT_DEV_I18N_PATH,
            useStorageForLocale: false,
          }),
        },
        { provide: Injector, useValue: null },
        { provide: ErrorBag, useClass: ErrorBag },
        { provide: TranslateService, useFactory: () => translateServiceMock },
        { provide: SectionsService, useFactory: () => sectionsServiceMock },
        { provide: ActivatedRoute, useFactory: () => activatedRouteMock },
        { provide: Router, useValue: routerSpy },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: SessionStorageService, useFactory: () => sessionStorageMock },
        { provide: SubmicroHeaderService, useFactory: () => submicroHeaderServiceMock },
        { provide: ProductsListEnvConfigService, useValue: listEnvServiceSpy },
        { provide: FORM_DATE_ADAPTER, useFactory: () => formDateAdapterMock },
        { provide: ElementRef, useClass: MockElementRef },
        provideMockStore({ initialState: { ...initialState, variant: { ...initialState.variant } } }),
      ],
      declarations: [
        VariantEditorComponent,

        MockEditorPicturesComponent,
        MockEditorDescriptionComponent,

        MockMainSectionComponent,
        MockInventorySectionComponent,
        MockCategorySectionComponent,
        MockVariantsSectionComponent,
        MockChannelsSectionComponent,
        MockTaxesSectionComponent,
        MockVisibilitySectionComponent,
        MockShippingSectionComponent,
        MockProductTypeComponent,
      ],
    }).compileComponents();

    store = TestBed.get(Store);

    store.overrideSelector(getVariant, {
      ...initialState.variant,
      id: mockedSelectorId,
      options: [{
        name: 'name 0',
        value: 'value 0',
      }, {
        name: 'name 1',
        value: 'value 1',
      }, {
        name: 'name 2',
        value: 'value 2',
      }],
      newOption: {
        name: 'name 3',
        value: 'value 3',
      },
    });
    store.overrideSelector(getLoaded, true);
  });

  afterEach(() => {
    fixture = undefined;
    component = undefined;
  });

  it('should navigate back to product editor on shortHeader close callback', () => {
    const variantIdParam = 'test-variant-id';
    const productId = 'product-id';
    const slug = 'slug';

    listEnvServiceSpy.getSlug.and.returnValue(slug);
    activatedRouteMock.params = of({ variantId: variantIdParam });
    activatedRouteMock.snapshot.data = {
      isVariantEdit: false,
      product: { data: { product } },
    };
    activatedRouteMock.snapshot.params = { productId };

    fixture = TestBed.createComponent(VariantEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    headerCloseCallback();

    const expectedUrlParts: string[] = [
      'business',
      slug,
      'products',
      'products-editor',
      productId,
      'variant-add-leave',
    ];

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      expectedUrlParts, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(VariantEditorComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should be defined', () => {
      expect(component).toBeDefined();
    });

    it('should contain modal header `Save` control', () => {
      const saveSpy: jasmine.Spy = spyOn(component, 'save');

      const menuItem: { text: string, onClick(): void } = component.modalHeaderControls.filter(mi => {
        return mi.text === 'ng_kit.toolbar.save';
      })[0];
      expect(menuItem).toBeDefined();

      menuItem.onClick();
      expect(saveSpy).toHaveBeenCalled();
    });

    it('#variant$ should get value from store on init', () => {
      expect(component.variant$.value.id).toBe(mockedSelectorId);
    });

    it('#variant$ must initialize `form` and `formScheme` once variant is received', () => {
      expect(component.form).toBeDefined();
      expect(component.formScheme).toBeDefined();
    });

    it('#ngOnInit should set product when editing existing variant', () => {
      expect(sectionsServiceMock.setProduct).toHaveBeenCalled();
    });

    it('#save should call doSubmit', () => {
      const doSubmitSpy: jasmine.Spy = spyOn(component, 'doSubmit');

      component.save();
      expect(doSubmitSpy).toHaveBeenCalled();
    });

    it('#onToggleSale should set required validators when `onSales.checked` is truthy', () => {
      variantsSection.onSales = false;

      const setValidatorsSpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'setValidators');
      const updateValueAndValiditySpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'updateValueAndValidity');

      component.onToggleSale({ checked: true });
      expect(setValidatorsSpy).toHaveBeenCalled();

      const validators: any[] = setValidatorsSpy.calls.argsFor(0)[0]; // first argument is validators array
      expect(validators).toContain(Validators.required);
      expect(updateValueAndValiditySpy).toHaveBeenCalled();
    });

    it('#onToggleSale should clear validators when `onSales.checked` is falsey', () => {
      variantsSection.onSales = true;

      const clearValidatorsSpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'clearValidators');
      const updateValueAndValiditySpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'updateValueAndValidity');

      component.onToggleSale({ checked: false });
      expect(clearValidatorsSpy).toHaveBeenCalled();
      expect(updateValueAndValiditySpy).toHaveBeenCalled();
    });

    it('#onSuccess should set variant and navigate back to products editor', () => {
      const productId = 'prod-id';
      const slug = 'slug';

      activatedRouteMock.snapshot.params.productId = productId;

      listEnvServiceSpy.getSlug.and.returnValue(slug);

      (component as any).onSuccess();

      const expectedUrl: string[] = ['business', slug, 'products', 'products-editor', productId];

      expect(sectionsServiceMock.setVariant).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(
        expectedUrl, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
    });

    it('#onDropSortImg drag item to new option section', () => {
      const dispatchSpy = spyOn(store, 'dispatch');

      component.onDropSortImg({
        previousIndex: 0,
        currentIndex: 3,
      } as CdkDragDrop<string[]>);

      const optionsListValues = component.optionsFormArray.getRawValue();
      const newOptionsValue = component.newOptionGroup.getRawValue();

      expect(optionsListValues[0].name).toEqual('name 1');
      expect(newOptionsValue.name).toEqual('name 0');

      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('#onDropSortImg drag new option section', () => {
      const dispatchSpy = spyOn(store, 'dispatch');

      component.onDropSortImg({
        previousIndex: 3,
        currentIndex: 0,
      } as CdkDragDrop<string[]>);

      const optionsListValues = component.optionsFormArray.getRawValue();
      const newOptionsValue = component.newOptionGroup.getRawValue();

      expect(optionsListValues[0].name).toEqual('name 3');
      expect(newOptionsValue.name).toEqual('name 2');

      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('#onDropSortImg drag inside list', () => {
      const dispatchSpy = spyOn(store, 'dispatch');
      const prevIndex = 2;

      component.onDropSortImg({
        previousIndex: prevIndex,
        currentIndex: 0,
      } as CdkDragDrop<string[]>);

      const optionsListValues = component.optionsFormArray.getRawValue();

      expect(optionsListValues[0].name).toEqual('name 2');
      expect(optionsListValues[1].name).toEqual('name 0');
      expect(optionsListValues[prevIndex].name).toEqual('name 1');

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'editor-pictures',
  template: '',
})
class MockEditorPicturesComponent {
  @Input()
  dragulaBag: any;
  @Input()
  blobs: any;
  @Output()
  changePictures = new EventEmitter();
}
@Component({
  selector: 'editor-description',
  template: '',
})
class MockEditorDescriptionComponent {
  @Input()
  description: any;
  @Input()
  invalid: any;
  @Input()
  compactSize: any;
  @Input()
  placeholder: any;
  @Output()
  valueChanged = new EventEmitter();
}
@Component({
  selector: 'main-section',
  template: '',
})
class MockMainSectionComponent {
}

@Component({
  selector: 'inventory-section',
  template: '',
})
class MockInventorySectionComponent {
  @Input()
  externalError: any;
}

@Component({
  selector: 'category-section',
  template: '',
})
class MockCategorySectionComponent {
  @Input()
  externalError: any;
}

@Component({
  selector: 'variants-section',
  template: '',
})
class MockVariantsSectionComponent {
}

@Component({
  selector: 'channels-section',
  template: '',
})
class MockChannelsSectionComponent {
}

@Component({
  selector: 'taxes-section',
  template: '',
})
class MockTaxesSectionComponent {
}

@Component({
  selector: 'visibility-section',
  template: '',
})
class MockVisibilitySectionComponent {
}

@Component({
  selector: 'shipping-section',
  template: '',
})
class MockShippingSectionComponent {
}

@Component({
  selector: 'product-type',
  template: '',
})
class MockProductTypeComponent {
}
