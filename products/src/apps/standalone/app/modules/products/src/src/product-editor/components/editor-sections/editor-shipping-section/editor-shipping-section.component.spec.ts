import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { I18nModule, LANG, TranslateService } from '@pe/i18n';

import { ProductEditorSections, ProductTypes } from '../../../enums';
import { SectionsService } from '../../../services';
import { EditorShippingSectionComponent } from './editor-shipping-section.component';

describe('EditorShippingSectionComponent', () => {
  let component: EditorShippingSectionComponent;
  let fixture: ComponentFixture<EditorShippingSectionComponent>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string) => key,
    } as TranslateService;

    sectionsServiceMock = {
      saveClicked$: new Subject<ProductEditorSections | string>(),
      saveClickedSuccess$: new Subject<boolean>(),
      productType$: new Subject<ProductTypes>(),
      productType: ProductTypes.Physical,
      onChangeShippingSection: jasmine.createSpy(),
      shippingSection: {
        weight: '',
        width: '',
        length: '',
        height: '',
      },
      onFindError: jasmine.createSpy(),
    } as any;

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
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
        EditorShippingSectionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorShippingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });
});
