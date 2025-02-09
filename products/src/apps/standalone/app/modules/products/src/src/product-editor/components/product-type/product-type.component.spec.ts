import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { I18nModule, LANG, TranslateService } from '@pe/i18n';

import { ProductTypes } from '../../enums';
import { SectionsService } from '../../services';
import { ProductTypeComponent } from './product-type.component';

describe('ProductTypeComponent', () => {
  let component: ProductTypeComponent;
  let fixture: ComponentFixture<ProductTypeComponent>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string) => key,
      hasTranslation: (key: string) => true,
    } as TranslateService;

    sectionsServiceMock = {
      productType: ProductTypes.Physical,
      productType$: new Subject<ProductTypes>(),
      onFindError: jasmine.createSpy(),
      onChangeProductType: jasmine.createSpy(),
    } as any;

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
        NoopAnimationsModule,
        MatButtonToggleModule,
        I18nModule,
      ],
      providers: [
        ErrorBag,
        { provide: Injector, useValue: null },

        { provide: LANG, useValue: 'en' },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
      ],
      declarations: [
        ProductTypeComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should init product type', () => {
    expect(component.productType).toEqual(ProductTypes.Physical);
  });

  it('onChange should update data in section service', () => {
    component.onChange(ProductTypes.Digital);

    expect(sectionsServiceMock.onChangeProductType).toHaveBeenCalledWith(ProductTypes.Digital);
  });
});
