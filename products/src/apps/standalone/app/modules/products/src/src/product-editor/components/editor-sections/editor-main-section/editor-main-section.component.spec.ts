import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { DEFAULT_DEV_I18N_PATH, I18nModule, LANG, LocaleConstantsService, TranslateService } from '@pe/i18n';

import { CurrencyService } from '../../../../../shared/services/currency.service';
import { ProductEditorSections } from '../../../enums';
import { SectionsService } from '../../../services';
import { EditorMainSectionComponent } from './editor-main-section.component';

describe('EditorMainSectionComponent', () => {
  const BUSINESS_ID = 'business_id';

  let component: EditorMainSectionComponent;
  let fixture: ComponentFixture<EditorMainSectionComponent>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;
  let currencyServiceMock: CurrencyService;

  let activatedRoute: any;

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string) => key,
    } as TranslateService;

    currencyServiceMock = {
      currency: 'currency',
    };

    sectionsServiceMock = {
      activeSection$: new Subject<ProductEditorSections>(),
      isUpdating$: new BehaviorSubject<boolean>(false),
      saveClicked$: new Subject<ProductEditorSections | string>(),
      mainSection: {},
      onFindError: jasmine.createSpy(),
      onChangeMainSection: jasmine.createSpy(),
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
        { provide: CurrencyService, useValue: currencyServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
      ],
      declarations: [
        EditorMainSectionComponent,

        MockEditorPicturesComponent,
        MockEditorDescriptionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorMainSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('onChangePictures should update images in sectionsService', () => {
    component.onChangePictures(['imageUrl']);

    expect(sectionsServiceMock.onChangeMainSection).toHaveBeenCalled();
  });

  it('onPicturesloadingChanged should toggle updating state in sectionsService', () => {
    const sectionsService = TestBed.get(SectionsService);
    const updatingSpy = spyOn(sectionsService.isUpdating$, 'next');

    component.onPicturesLoadingChanged(true);

    expect(updatingSpy).toHaveBeenCalled();
  });

  it('onToggleSale should change validators', () => {
    const setValidatorSpy = spyOn(component.form.controls.salePrice, 'setValidators');
    const clearValidatorSpy = spyOn(component.form.controls.salePrice, 'clearValidators');

    component.onToggleSale({ checked: true });
    expect(setValidatorSpy).toHaveBeenCalled();
    expect(clearValidatorSpy).not.toHaveBeenCalled();

    setValidatorSpy.calls.reset();
    clearValidatorSpy.calls.reset();

    component.onToggleSale({ checked: false });
    expect(setValidatorSpy).not.toHaveBeenCalled();
    expect(clearValidatorSpy).toHaveBeenCalled();
  });

  it('onDescriptionChange should update value in form', () => {
    const newText = 'new text';
    component.onDescriptionChange(newText);

    expect(component.form.get('description').value).toEqual(newText);
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });
});

@Component({
  selector: 'editor-pictures',
  template: '',
})
class MockEditorPicturesComponent {
  @Input()
  dragulaBag: string;
  @Input()
  blobs: string[];

  @Output()
  blobsChenge = new EventEmitter<string[]>();
  @Output()
  changePictures = new EventEmitter<string[]>();
  @Output()
  loadingStateChanged = new EventEmitter<boolean>();
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
