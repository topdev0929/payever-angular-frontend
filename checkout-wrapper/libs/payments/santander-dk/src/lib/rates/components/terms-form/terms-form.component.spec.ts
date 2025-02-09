import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import { DialogService } from '@pe/checkout/dialog';
import { openLabelModal } from '@pe/checkout/form-utils';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { TermsFormComponent } from './terms-form.component';

jest.mock('@pe/checkout/form-utils', () => ({
  ...jest.requireActual('@pe/checkout/form-utils'),
  openLabelModal: jest.fn(),
}));

describe('TermsFormComponent', () => {
  let component: TermsFormComponent;
  let fixture: ComponentFixture<TermsFormComponent>;

  let store: Store;
  let dialogService: DialogService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [TermsFormComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        DialogService,
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    dialogService = TestBed.inject(DialogService);


    fixture = TestBed.createComponent(TermsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should have a form group with two controls', () => {

    expect(component.formGroup.contains('digitalConsent')).toBe(true);
    expect(component.formGroup.contains('acceptBusinessTerms')).toBe(true);

  });

  it('should set digitalConsent to true when checkbox clicked', () => {

    expect(component.formGroup.get('digitalConsent').value).toBe(false);
    const checkbox = fixture.debugElement.query(By.css('[formControlName="digitalConsent"] span')).nativeElement;
    checkbox.click();
    expect(component.formGroup.get('digitalConsent').value).toBe(true);

  });

  it('should set acceptBusinessTerms to true when checkbox clicked', () => {

    expect(component.formGroup.get('acceptBusinessTerms').value).toBe(false);
    const checkbox = fixture.debugElement.query(By.css('[formControlName="acceptBusinessTerms"] span')).nativeElement;
    checkbox.click();
    expect(component.formGroup.get('acceptBusinessTerms').value).toBe(true);

  });

  it('should openLabelModal on onAcceptBusinessTermsClick', () => {
    const openLabelModalSpy = (openLabelModal as jest.Mock);
    const event = new MouseEvent('click');
    component.onAcceptBusinessTermsClick(event);
    expect(openLabelModalSpy).toHaveBeenCalledWith(
      event,
      dialogService,
      {
        flowId: flowWithPaymentOptionsFixture().id,
        title: expect.any(String),
        text: expect.any(String),
      });
  });

});
