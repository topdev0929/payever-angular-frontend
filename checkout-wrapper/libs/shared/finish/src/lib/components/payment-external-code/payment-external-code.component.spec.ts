import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, timer } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { VerificationTypeEnum } from '@pe/checkout/api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { ExternalCodeService } from '../../services';

import { PaymentExternalCodeComponent } from './payment-external-code.component';

describe('payment-external-code', () => {
  let component: PaymentExternalCodeComponent;
  let fixture: ComponentFixture<PaymentExternalCodeComponent>;

  let externalCodeService: ExternalCodeService;
  let getViewModel: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      declarations: [PaymentExternalCodeComponent],
      providers: [...CommonProvidersTestHelper(), ExternalCodeService],
    }).compileComponents();

    externalCodeService = TestBed.inject(ExternalCodeService);

    fixture = TestBed.createComponent(PaymentExternalCodeComponent);
    component = fixture.componentInstance;

    getViewModel = jest.spyOn(externalCodeService, 'getViewModel');
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('loader', () => {
    it('should show loader correctly', (done) => {
      getViewModel.mockReturnValue(timer(1000) as any);

      component.ngOnInit();
      component.vm$
        .pipe(
          tap(() => {
            fixture.detectChanges();
            const loader = fixture.debugElement.query(By.css('div')).nativeElement;
            expect(loader).toBeTruthy();
            expect(loader.className).toContain('loader-container loader-fade-light');
          }),
          delay(1001),
          tap(() => {
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('div'))).toBeNull();
            done();
          })
        )
        .subscribe();
    });
  });

  describe('CodeViewModel', () => {
    it('should show verification required title if code is not provided', () => {
      getViewModel.mockReturnValue(of({ codeData: { code: null } }));
      component.ngOnInit();
      fixture.detectChanges();
      const title = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(title.textContent).toContain('checkout_sdk.payment_external_code.verification_required');
    });

    it('should return null if vm error', () => {
      getViewModel.mockReturnValue(throwError(new Error()));
      component.ngOnInit();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.all())).toBeNull();
    });

    it('should show confirmation code if code is provided', () => {
      getViewModel.mockReturnValue(of({ codeData: { code: 'some-code' } }));
      component.ngOnInit();
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('p')).nativeElement;
      const confirmNumber = fixture.debugElement.query(By.css('div.confirm-number')).nativeElement;
      const description = fixture.debugElement.query(By.css('div.text-secondary')).nativeElement;

      expect(title.textContent).toContain('checkout_sdk.payment_external_code.confirmation_code');
      expect(confirmNumber.textContent).toContain('some-code');
      expect(description.textContent).toContain('checkout_sdk.payment_external_code.description');
    });

    it('should show verification required title if secondFactor and verification by id', () => {
      getViewModel.mockReturnValue(
        of({
          codeData: { code: 'some-code' },
          secondFactor: true,
          verificationType: VerificationTypeEnum.VERIFY_BY_ID,
        })
      );
      component.ngOnInit();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('div.text-secondary')).nativeElement.textContent).toContain(
        'checkout_sdk.payment_external_code.verification_required'
      );
    });
  });
});
