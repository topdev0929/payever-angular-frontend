import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { PaymentState, SetFlow, SetPayments, PatchFormState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { ContinueButtonComponent } from '@pe/checkout/ui/continue-button';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';

import { EmploymentChoice, PERSON_TYPE, PersonTypeEnum } from '../../..';
import { flowWithPaymentOptionsFixture } from '../../../../test';

import { EmploymentFormComponent } from './employment-form.component';

describe('EmploymentFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: EmploymentFormComponent;
  let fixture: ComponentFixture<EmploymentFormComponent>;
  let store: Store;
  const personType = PersonTypeEnum.Customer;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
        {
          provide: PERSON_TYPE,
          useValue: personType,
        },
      ],
      declarations: [
        ContinueButtonComponent,
        ProgressButtonContentComponent,
        EmploymentFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: {
            ratesForm: {
              customer: {
                employment: '4',
                freelancer: false,
              },
            },
          },
        },
      },
    }));

    fixture = TestBed.createComponent(EmploymentFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('translations', () => {
    it('should handle if isStudent true', () => {
      store.dispatch(new PatchFormState({
        ratesForm: {
          customer: {
            employment: EmploymentChoice.STUDENT,
          },
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(EmploymentFormComponent);
      component = fixture.componentInstance;

      component.translations$.pipe(
        tap((translations) => {
          expect(translations).toMatchObject({
            title: $localize`:@@santander-de.inquiry.step.customer_employment.title_study:`,
            employer: {
              label: $localize`:@@santander-de.inquiry.form.customer.schoolOrUniversity.label:`,
            },
            employedSince: {
              label: $localize`:@@santander-de.inquiry.form.customer.studySince.label:`,
            },
            employmentLimited: $localize`:@@santander-de.inquiry.form.customer.employmentLimited.label:`,
          });
        })
      ).subscribe();

    });

    it('should handle if isStudent false', () => {
      store.dispatch(new PatchFormState({
        ratesForm: {
          customer: {
            employment: EmploymentChoice.EMPLOYEE,
          },
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(EmploymentFormComponent);
      component = fixture.componentInstance;


      component.translations$.pipe(
        tap((translations) => {
          expect(translations).toMatchObject({
            title: $localize`:@@santander-de.inquiry.step.customer_employment.title_employment:`,
            employer: {
              label: $localize`:@@santander-de.inquiry.form.customer.employer.label:`,
            },
            employedSince: {
              label: $localize`:@@santander-de.inquiry.form.customer.employedSince.label:`,
            },
            employmentLimited: $localize`:@@santander-de.inquiry.form.customer.employmentLimited.label:`,
          });
        })
      ).subscribe();
    });
  });

  describe('ngOnInit', () => {
    it('should disable freelancerForm if the customer is a not freelancer', () => {

      component.ngOnInit();

      expect(component.formGroup.get('freelancer').disabled).toBeTruthy();
    });

    it('should enable freelancerForm if the customer is a freelancer', () => {
      component.ngOnInit();
      store.dispatch(new PatchFormState({
        [personType]: {
          personalForm: {
            freelancer: true,
          },
        },
      }));

      expect(component.formGroup.get('freelancer').enabled).toBeTruthy();
    });

    it('should disable employmentLimited and employedUntil if isStudent true', () => {
      component.ngOnInit();
      store.dispatch(new PatchFormState({
        [personType]: {
          personalForm: {
            employment: EmploymentChoice.STUDENT,
          },
        },
      }));

      expect(component.formGroup.get('employmentLimited').disabled).toBeTruthy();
      expect(component.formGroup.get('employedUntil').disabled).toBeTruthy();
    });
    it('should enable employmentLimited if isStudent false', () => {
      component.ngOnInit();
      store.dispatch(new PatchFormState({
        [personType]: {
          personalForm: {
            employment: EmploymentChoice.EMPLOYEE,
          },
        },
      }));

      expect(component.formGroup.get('employmentLimited').enabled).toBeTruthy();
    });

    it('should enable employer controls if the customer is employed', () => {
      component.ngOnInit();

      expect(component.formGroup.get('employer').enabled).toBe(true);
      expect(component.formGroup.get('employedSince').enabled).toBe(true);
    });

    it('should toggleEmployedUntil work correctly', () => {
      component.ngOnInit();
      component.formGroup.get('employedUntil').disable();
      component.formGroup.get('employmentLimited').setValue(true);
      expect(component.formGroup.get('employedUntil').enabled).toBeTruthy();
    });

    it('should togglePrev$ work correctly', () => {
      component.ngOnInit();

      component.formGroup.get('employedSince').setValue(new Date(2024, 1, 1));
      expect(component.formGroup.get('prevEmployer').enabled).toBeTruthy();
      expect(component.formGroup.get('prevEmployedSince').enabled).toBeTruthy();

      component.formGroup.get('employedSince').setValue(new Date(2015, 1, 1));
      expect(component.formGroup.get('prevEmployer').disabled).toBeTruthy();
      expect(component.formGroup.get('prevEmployedSince').disabled).toBeTruthy();
    });
  });

});
