import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { LANG, TranslateService } from '@pe/i18n';

import { SectionsService } from '../../../services';
import { EditorTaxesSectionComponent } from './editor-taxes-section.component';

describe('EditorTaxesSectionComponent', () => {
  let component: EditorTaxesSectionComponent;
  let fixture: ComponentFixture<EditorTaxesSectionComponent>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;

  let activatedRoute: any;

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string) => key,
      hasTranslation: (key: string) => true,
    } as TranslateService;

    activatedRoute = {
      snapshot: {
        data: {
          vatRates: [{
            description: 'Rate description 1',
            rate: 1,
          }, {
            description: 'Rate description 2',
            rate: 2,
          }],
        },
      },
    };

    sectionsServiceMock = {
      taxesSection: {
        vatRate: 1,
      },
      onFindError: jasmine.createSpy(),
      onChangeTaxesSection: jasmine.createSpy(),
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
        ErrorBag,
        { provide: Injector, useValue: null },

        { provide: LANG, useValue: 'en' },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
      ],
      declarations: [
        EditorTaxesSectionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorTaxesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should init options for drop down', () => {
    const expectedLength = 2;

    expect(component.ratesOptions.length).toEqual(expectedLength);
    expect(component.ratesOptions[0].label).toBeDefined();
    expect(component.ratesOptions[0].value).toBeDefined();
  });

  it('onUpdateFormData should update data in section service', () => {
    (sectionsServiceMock.onChangeTaxesSection as jasmine.Spy).calls.reset();
    component.form.setValue({ vatRate: 2 });

    expect(sectionsServiceMock.onChangeTaxesSection).toHaveBeenCalledWith({
      vatRate: 2,
    });
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });
});
