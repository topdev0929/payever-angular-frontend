import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { AutocompleteChipsEventType, ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { LANG, TranslateService } from '@pe/i18n';

import { ApiService } from '../../../core/core.module';
import { ProductEditorSections } from '../../../enums';
import { Category, ExternalError } from '../../../interfaces';
import { SectionsService } from '../../../services';
import { EditorCategorySectionComponent } from './editor-category-section.component';

describe('EditorCategorySectionComponent', () => {
  const BUSINESS_ID = 'business_id';
  const categories = [
    {
      id: 'id 0',
      slug: BUSINESS_ID,
      title: 'category 0',
      businessUuid: BUSINESS_ID,
    }, {
      id: 'id 1',
      slug: BUSINESS_ID,
      title: 'category 1',
      businessUuid: BUSINESS_ID,
    },
  ];

  const newCategory = {
    id: 'new_id',
    slug: BUSINESS_ID,
    title: 'new category',
    businessUuid: BUSINESS_ID,
  };

  let component: EditorCategorySectionComponent;
  let fixture: ComponentFixture<EditorCategorySectionComponent>;

  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let errorBagSpy: jasmine.SpyObj<ErrorBag>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;

  let activatedRoute: any;

  beforeEach(() => {

    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', [
      'getCategories',
      'createCategory',
    ]);
    apiServiceSpy.getCategories.and.returnValue(new Observable<Category | any>((observer) => {
      observer.next({
        data: {
          getCategories: categories,
        },
      });
      observer.complete();
    }));
    apiServiceSpy.createCategory.and.returnValue(new Observable((observer) => {
      observer.next({
        data: {
          createCategory: newCategory,
        },
      });
      observer.complete();
    }));

    errorBagSpy = jasmine.createSpyObj<ErrorBag>('ErrorBag', ['setErrors']);

    translateServiceMock = {
      translate: (key: string) => key,
    } as TranslateService;

    activatedRoute = {
      snapshot: {
        params: {
          slug: BUSINESS_ID,
        },
      },
    };

    sectionsServiceMock = {
      activeSection$: new Subject<ProductEditorSections>(),
      saveClicked$: new Subject<ProductEditorSections | string>(),
      allCategories: [],
      categorySection: {
        categories: [],
      },
      onChangeCategorySection: jasmine.createSpy(),
      prepareCategories: jasmine.createSpy(),
      onFindError: jasmine.createSpy(),
    } as any;

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: Injector, useValue: null },

        { provide: LANG, useValue: 'en' },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ApiService, useValue: apiServiceSpy },
      ],
      declarations: [
        EditorCategorySectionComponent,
      ],
    }).overrideComponent(EditorCategorySectionComponent, {
      set: {
        providers: [
          { provide: ErrorBag, useValue: errorBagSpy },
        ],
      },
    }).compileComponents();

    fixture = TestBed.createComponent(EditorCategorySectionComponent);
    component = fixture.componentInstance;
    component.externalError = new Subject<ExternalError>();
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('externalError should set errors in errorBag', (done) => {
    errorBagSpy.setErrors.and.callFake(() => {
      expect(errorBagSpy.setErrors).toHaveBeenCalled();
      done();
    });

    component.externalError.next({
      section: ProductEditorSections.Category,
    } as ExternalError);
  });

  it('onCategoryChange should create new category', () => {
    const sectionService = TestBed.get(SectionsService);

    component.onCategoryChange({
      eventType: AutocompleteChipsEventType.Add,
      value: 'new value',
    });

    expect(apiServiceSpy.createCategory).toHaveBeenCalled();
    expect(sectionService.allCategories).toContain(newCategory);
  });

  it('validateInput should check duplicated values', () => {
    component.form.setValue({
      categories: [categories[0].title],
    });

    expect(component.validateInput('new value')).toEqual(true);
    expect(component.validateInput(categories[0].title)).toEqual(false);
  });

  it('onSubmit should prepare categories', () => {
    component.form.setValue({
      categories: [categories[0].title],
    });

    component.onSubmit();

    expect(sectionsServiceMock.prepareCategories).toHaveBeenCalled();
  });

  it('onSubmit should call onFindError if form invalid', () => {
    component.form.setValue({
      categories: [categories[0].title, categories[0].title],
    });

    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });

  it('onUpdateFormData should update data in section service', () => {
    component.form.setValue({ categories: ['value'] });

    expect(sectionsServiceMock.onChangeCategorySection).toHaveBeenCalledWith({
      categories: [{ title: 'value' }],
    });
  });
});
