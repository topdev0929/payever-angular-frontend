import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { LANG, TranslateService } from '@pe/i18n';

import { SectionsService } from '../../../services';
import { EditorVisibilitySectionComponent } from './editor-visibility-section.component';

describe('EditorVisibilitySectionComponent', () => {
  let component: EditorVisibilitySectionComponent;
  let fixture: ComponentFixture<EditorVisibilitySectionComponent>;

  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string) => key,
      hasTranslation: (key: string) => true,
    } as TranslateService;

    sectionsServiceMock = {
      visibilitySection: {
        active: false,
      },
      onFindError: jasmine.createSpy(),
      onChangeVisibilitySection: jasmine.createSpy(),
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
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
      ],
      declarations: [
        EditorVisibilitySectionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorVisibilitySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('onUpdateFormData should update data in section service', () => {
    (sectionsServiceMock.onChangeVisibilitySection as jasmine.Spy).calls.reset();
    component.form.setValue({ active: true });

    expect(sectionsServiceMock.onChangeVisibilitySection).toHaveBeenCalledWith({
      active: true,
    });
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });
});
