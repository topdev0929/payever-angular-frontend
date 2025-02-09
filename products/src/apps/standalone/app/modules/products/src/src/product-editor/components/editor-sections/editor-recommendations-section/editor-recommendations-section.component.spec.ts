import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { DEFAULT_DEV_I18N_PATH, I18nModule, LANG, LocaleConstantsService, TranslateService } from '@pe/i18n';

import { ProductsApiService } from '../../../../shared/services/api.service';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { SectionsService } from '../../../services';
import { EditorRecommendationsSectionComponent } from './editor-recommendations-section.component';
import { RecommendationsInterface } from '../../../../shared/interfaces/recommendations.interface';

describe('EditorRecommendationsSectionComponent', () => {
  let component: EditorRecommendationsSectionComponent;
  let fixture: ComponentFixture<EditorRecommendationsSectionComponent>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;
  let apiServiceSpy: jasmine.SpyObj<ProductsApiService>;

  const allRecommendations = [
    {
      tag: 'byCategory',
      recommendations: [
          {
              id: '1',
              name: 'Books',
          },
          {
            id: '2',
            name: 'Electronics',
          },
      ],
    },
    {
        tag: 'byCollection',
        recommendations: [
            {
                id: '1',
                name: 'Winter Collection',
            },
            {
              id: '2',
              name: 'Summer Collection',
            },
        ],
      },
      {
        tag: 'IndividualProduct',
        recommendations: [
            {
                id: '1',
                name: 'My TV',
            },
            {
              id: '2',
              name: 'My book',
            },
        ],
      },
  ];

  const productRecommendations = {
    tag: 'byCategory',
    recommendations: [
      {
        id: '1',
        name: 'Books',
      },
    ],
  };

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string) => key,
    } as TranslateService;

    apiServiceSpy = jasmine.createSpyObj<ProductsApiService>('ProductsApiService', [
      'getRecommendations',
      'getProductRecommendations',
    ]);
    apiServiceSpy.getRecommendations.and.returnValue(new Observable<RecommendationsInterface | any>((observer) => {
      observer.next({
        data: {
          getRecommendations: allRecommendations,
        },
      });
      observer.complete();
    }));
    apiServiceSpy.getProductRecommendations.and.returnValue(new Observable((observer) => {
      observer.next({
        data: {
          getProductRecommendations: productRecommendations,
        },
      });
      observer.complete();
    }));

    sectionsServiceMock = {
      activeSection$: new Subject<ProductEditorSections>(),
      isUpdating$: new BehaviorSubject<boolean>(false),
      saveClicked$: new Subject<ProductEditorSections | string>(),
      allRecommendations: {},
      onFindError: jasmine.createSpy(),
      onChangeRecommendationsSection: jasmine.createSpy(),
    } as any;

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
        I18nModule,
        NoopAnimationsModule,
      ],
      providers: [
        ErrorBag,
        { provide: Injector, useValue: null },
        { provide: LocaleConstantsService, useValue: new LocaleConstantsService({
          isProd: false,
          i18nPath: DEFAULT_DEV_I18N_PATH,
          useStorageForLocale: false,
        })},

        { provide: LANG, useValue: 'en' },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
        { provide: ProductsApiService, useValue: apiServiceSpy },

      ],
      declarations: [
        EditorRecommendationsSectionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorRecommendationsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('onChipChange should call onChangeRecommendationsSection', () => {
    const sectionService = TestBed.get(SectionsService);

    component.onChipChange({
      value: 'new value',
    });

    expect(sectionService.onChangeRecommendationsSection).toHaveBeenCalled();
  });

  it('onRecommendationTagChanged should call onChangeRecommendationsSection', () => {
    const sectionService = TestBed.get(SectionsService);

    component.onChipChange({
      value: 'new value',
    });

    expect(sectionService.onChangeRecommendationsSection).toHaveBeenCalled();
  });

  it('validateChipInput should return false', () => {
    const result: any = component.validateChipInput('isCategory' as any)('my value');

    expect(result).toEqual(false);
  });

  it('validateChipInput should return true', () => {
    const result: any = component.validateChipInput('isCategory' as any)('Books');

    expect(result).toEqual(true);
  });

  it('addProduct should call onChangeRecommendationsSection', () => {
    const sectionsService = TestBed.get(SectionsService);
    component.form.get('productRecommendation').setValue('my product');

    component.addProduct();

    expect(sectionsService.onChangeRecommendationsSection).toHaveBeenCalled();
  });

  it('removeRecommendation should call onChangeRecommendationsSection', () => {
    const sectionsService = TestBed.get(SectionsService);
    component.form.get('productRecommendation').setValue('my product');

    component.removeRecommendation({id: '1', name: 'Books'} as any);

    expect(sectionsService.onChangeRecommendationsSection).toHaveBeenCalled();
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });
});

