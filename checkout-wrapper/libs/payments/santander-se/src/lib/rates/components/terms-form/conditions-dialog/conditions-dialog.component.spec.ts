import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { DIALOG_DATA, DialogModule } from '@pe/checkout/dialog';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';



import { ConditionsDialogComponent, ConditionsDialogDataInterface } from './conditions-dialog.component';


describe('santander-se-conditions-dialog', () => {
  let component: ConditionsDialogComponent;
  let fixture: ComponentFixture<ConditionsDialogComponent>;
  let termsForm: FormControl<ConditionsDialogComponent>;
  let debugElement: HTMLElement;

  beforeEach(() => {
    const fb = new FormBuilder();
    termsForm = fb.control<ConditionsDialogComponent>(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        DialogModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: termsForm,
        },
        {
          provide: DIALOG_DATA,
          useValue: {

          } as ConditionsDialogDataInterface,
        },
        { provide: MatDialogRef, useValue: { close: (result: any) => result } },
      ],
      declarations: [
        ConditionsDialogComponent,
      ],
    });
    fixture = TestBed.createComponent(ConditionsDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    debugElement = fixture.debugElement.nativeElement;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('dialog', () => {
    it('should show the conditions details', () => {
      jest.spyOn(component, 'translations', 'get')
        .mockReturnValue({ fullText: 'conditions detail' });
      fixture.detectChanges();

      const detailsDiv: HTMLDivElement = debugElement.querySelector('.dialog-container div');
      const detailsTitle: HTMLDivElement = debugElement.querySelector('.dialog-container h2');
      expect(detailsTitle.innerHTML).toContain('santander-se.inquiry.form.accept_conditions.details.title');
      expect(detailsDiv.innerHTML).toBe('conditions detail');
    });

    it('should get translations', () => {
      const translations = jest.spyOn(component, 'translations', 'get')
        .mockReturnValue({ fullText: 'conditions detail' });

      expect(component.translations).toEqual({ fullText: 'conditions detail' });
      expect(translations).toHaveBeenCalled();
    });
  });
});

