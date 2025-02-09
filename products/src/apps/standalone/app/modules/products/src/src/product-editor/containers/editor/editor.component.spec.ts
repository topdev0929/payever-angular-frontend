import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { MicroContainerTypeEnum, PlatformService } from '@pe/common';
import { I18nModule, TranslateService } from '@pe/i18n';

import { SnackBarService } from '../../../snackbar';
import { ProductsListEnvConfigService } from '../../../config';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { HeaderService } from '../../../../shared/services/header.service';
import { SubmicroHeaderService } from '../../../../shared/services/submicro-header.service';
import { DEFAULT_VAT_RATE } from '../../core/vat-rates.resolver';
import { ProductEditorSections, ProductTypes } from '../../enums';
import { VariantsSection } from '../../interfaces';
import { SectionsService } from '../../services';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
  const BUSINESS_ID = 'BUSINESS_ID';

  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let headerServiceSpy: jasmine.SpyObj<HeaderService>;
  let submicroHeaderServiceSpy: jasmine.SpyObj<SubmicroHeaderService>;
  let listEnvServiceSpy: jasmine.SpyObj<ProductsListEnvConfigService>;
  let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;

  let platformServiceMock: PlatformService;
  let currencyServiceMock: CurrencyService;
  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;
  let activatedRouteMock: any;


  beforeEach(() => {

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    headerServiceSpy = jasmine.createSpyObj<HeaderService>('HeaderService', ['setHeader']);
    submicroHeaderServiceSpy = jasmine.createSpyObj<SubmicroHeaderService>('SubmicroHeaderService', ['appendShortHeader']);
    listEnvServiceSpy = jasmine.createSpyObj<ProductsListEnvConfigService>('ProductsListEnvConfigService', ['getSlug']);
    listEnvServiceSpy.getSlug.and.returnValue(BUSINESS_ID);
    snackBarServiceSpy = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['show']);

    currencyServiceMock = {
      currency: 'currency',
    } as CurrencyService;

    platformServiceMock = {
      blurryBackdrop: true,
      microContainerType: MicroContainerTypeEnum.Layout,
    } as PlatformService;

    translateServiceMock = {
      translate: (key: string) => key,
      hasTranslation: (_: string) => true,
    } as TranslateService;

    activatedRouteMock = {
      snapshot: {
        data: {
          business: {},
          vatRates: [DEFAULT_VAT_RATE],
          product: {
            currency: '',
          },
        },
        params: {
          channelId: '',
        },
        queryParams: {
          app: {},
          prevProductsPath: {},
        },
      },
    };

    sectionsServiceMock = {
      productType: ProductTypes.Physical,
      activeSection: ProductEditorSections.Main,
      activeSection$: new Subject<ProductEditorSections>(),
      variantsChange$: new Subject<VariantsSection[]>(),
      isUpdating$: new BehaviorSubject(false),

      isEdit: false,

      setProduct: jasmine.createSpy(),
      haveErrors: jasmine.createSpy(),
      model: {
        id: BUSINESS_ID,
      },
      resetState$: new BehaviorSubject<boolean>(true),
      categorySection: {
        categories: [],
      },
      variantsSection: {

      },
      shippingSection: {

      },
      channelsGroups: [],
      taxesSection: {
        vatRate: '',
      },
    } as any;

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
        ErrorBag,
        ChangeDetectorRef,

        { provide: HeaderService, useValue: headerServiceSpy },
        { provide: SubmicroHeaderService, useValue: submicroHeaderServiceSpy },
        { provide: ProductsListEnvConfigService, useValue: listEnvServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: PlatformService, useValue: platformServiceMock },
        { provide: CurrencyService, useValue: currencyServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
      ],
      declarations: [
        EditorComponent,

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

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should set and remove section', () => {
    component.setStep(ProductEditorSections.Taxes);
    expect(component.activeSection).toEqual(ProductEditorSections.Taxes);

    component.removeStep(ProductEditorSections.Taxes);
    expect(component.activeSection).toEqual(null);
  });

  it('should handle external sku error', () => {
    const nextSpy = spyOn(component.externalError$, 'next');

    component.handleError({
      graphQLErrors: [],
    });

    expect(nextSpy).not.toHaveBeenCalled();

    component.handleError({
      graphQLErrors: [{
        message: 'This value is already used',
      }],
    });

    expect(nextSpy).toHaveBeenCalled();
  });

  it('should navigate back to list and show notification', () => {
    component.handleSave();

    expect(snackBarServiceSpy.show).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });
});

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
