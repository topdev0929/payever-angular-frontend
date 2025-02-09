import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchPaymentDetails, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { InquiryFormComponent } from './inquiry-form.component';

describe('stripe-direct-debit-inquiry-form', () => {
  let store: Store;
  let component: InquiryFormComponent;
  let fixture: ComponentFixture<InquiryFormComponent>;
  let formGroup: InstanceType<typeof InquiryFormComponent>['formGroup'];
  const submit$ = new Subject<number>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: PaymentSubmissionService, useValue: submit$ },
      ],
      declarations: [
        InquiryFormComponent,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentDetails({
      iban: 'initial-iban',
    }));
    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
    fixture.detectChanges();
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


  describe('component', () => {
    it('SHould patch fromGroup with payment-details', () => {
      fixture.detectChanges();
      fixture.changeDetectorRef.markForCheck();
      component.ngOnInit();
      expect(formGroup.value).toEqual({ iban: 'initial-iban' });
    });

    it('Should emit submitted when from becomes valid', (done) => {
      formGroup.setAsyncValidators([
        jest.fn().mockReturnValue(of(null)),
      ]);
      const submitted = jest.spyOn(component.submitted, 'emit');

      component.submitted.pipe(
        tap(() => {
          expect(submitted).toHaveBeenCalledWith({ iban: 'iban' });
          done();
        })
      ).subscribe();

      formGroup.patchValue({
        iban: 'iban',
      });
      submit$.next(Date.now());
    });

    it('Should set businessName', () => {
      expect(component.translations$.value).toEqual({ 'acceptMandate': '---' });
      component.businessName = 'businessName';
      const acceptMandate = component.translations$.value.acceptMandate;
      expect(acceptMandate.endsWith('businessName')).toBe(true);
    });
  });
});

