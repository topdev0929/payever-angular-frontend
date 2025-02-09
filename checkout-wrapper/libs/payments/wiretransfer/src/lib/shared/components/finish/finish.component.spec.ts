import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import { DefaultReceiptComponent } from '@pe/checkout/finish/components';
import { SetFlow } from '@pe/checkout/store';
import {
    CommonImportsTestHelper,
    CommonProvidersTestHelper,
    FinishDeclarationsTestHelper,
    FinishProvidersTestHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentStatusEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { nodeResultFixture } from '../../../test/fixtures/node-result.fixture';

import { FinishComponent } from './finish.component';

describe('FinishComponent', () => {
    let component: FinishComponent;
    let fixture: ComponentFixture<FinishComponent>;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            declarations: [
                ...FinishDeclarationsTestHelper(),
                DefaultReceiptComponent,
                FinishComponent,
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                ...FinishProvidersTestHelper(),
                {
                    provide: LocaleConstantsService,
                    useValue: {
                        getLang: jest.fn().mockReturnValue('de-DE'),
                    },
                },
            ],
        });
    });

    beforeEach(() => {
        registerLocaleData(de.default);

        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(FinishComponent);
        component = fixture.componentInstance;
    });

    beforeEach(() => {
        component.nodeResult = nodeResultFixture();
        component.embeddedMode = true;
        component.isLoading = false;
        component.isChangingPaymentMethod = false;
        component.errorMessage = '';

    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('constructor', () => {
        it('Should check if component defined', () => {
            expect(component).toBeDefined();
        });
    });

    describe('isStatusSuccess', () => {
        it('should return true if status is STATUS_ACCEPTED', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

            expect(component.isStatusSuccess()).toBe(true);
        });

        it('should return true if status is STATUS_PAID', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_PAID);

            expect(component.isStatusSuccess()).toBe(true);
        });

        it('should return false for other statuses', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);

            expect(component.isStatusSuccess()).toBe(false);
        });

    });

    describe('isStatusPending', () => {

        it('should return true if status is STATUS_IN_PROCESS', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);

            expect(component.isStatusPending()).toBe(true);
        });

        it('should return false for other statuses', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);

            expect(component.isStatusPending()).toBe(false);
        });
    });

    describe('isStatusFail', () => {

        it('should return true if status is STATUS_FAILED', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_FAILED);

            expect(component.isStatusFail()).toBe(true);
        });

        it('should return true if status is STATUS_DECLINED', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_DECLINED);

            expect(component.isStatusFail()).toBe(true);
        });

        it('should return false for other statuses', () => {
            jest.spyOn(component, 'getPaymentStatus')
                .mockReturnValue(PaymentStatusEnum.STATUS_PAID);

            expect(component.isStatusFail()).toBe(false);
        });
    });

    describe('Template', () => {
        it('should display total amount if payment is successful or pending', () => {
            jest.spyOn(component, 'isStatusSuccess').mockReturnValue(true);

            fixture.detectChanges();

            const totalAmountElement = fixture.debugElement.query(By.css('[data-test-id="totalAmount"]'));

            expect(totalAmountElement.nativeElement.innerHTML)
                .toContain('1.000,00&nbsp;€');
        });

        it('should display payment details', () => {
            jest.spyOn(component, 'isStatusSuccess').mockReturnValue(true);
            jest.spyOn(component, 'paymentDetails', 'get').mockReturnValue({
                accountHolder: 'John Doe',
                bankName: 'Sample Bank',
                bankCity: 'Sample City',
                iban: 'SampleIBAN',
                bic: 'SampleBIC',
            });
            fixture.detectChanges();

            const accountHolderElement = fixture.debugElement
                .query(By.css('[data-test-id="accountHolder"]'));
            expect(accountHolderElement.nativeElement.textContent).toContain('John Doe');

            const bankNameElement = fixture.debugElement.query(By.css('[data-test-id="bankName"]'));
            expect(bankNameElement.nativeElement.textContent).toContain('Sample Bank');

            const bankCityElement = fixture.debugElement.query(By.css('[data-test-id="bankCity"]'));
            expect(bankCityElement.nativeElement.textContent).toContain('Sample City');

            const ibanElement = fixture.debugElement
                .query(By.css('[data-test-id="iban"]'));
            expect(ibanElement.nativeElement.textContent).toContain('SampleIBAN');

            const bicElement = fixture.debugElement.query(By.css('[data-test-id="bic"]'));
            expect(bicElement.nativeElement.textContent).toContain('SampleBIC');
        });

        it('should display business name and creation date', () => {
            jest.spyOn(component, 'isStatusSuccess').mockReturnValue(true);
            jest.spyOn(component, 'createdAt', 'get').mockReturnValue('2000-01-02');

            component.nodeResult = {
                payment: {
                    businessName: 'Sample Business',
                },
            } as NodePaymentResponseInterface<any>;

            fixture.detectChanges();

            const businessNameElement = fixture.debugElement.query(By.css('[data-test-id="businessName"]'));
            expect(businessNameElement.nativeElement.textContent).toContain('Sample Business');

            const createdAtElement = fixture.debugElement.query(By.css('[data-test-id="createdAt"]'));
            expect(createdAtElement.nativeElement.textContent).toContain('2000-01-02');
        });

        it('should not display address line if addressLine returns falsy value', () => {
            const testHostComponent = fixture.componentInstance;
            jest.spyOn(testHostComponent, 'addressLine').mockReturnValue('');
            jest.spyOn(component, 'isStatusSuccess').mockReturnValue(true);

            fixture.detectChanges();

            const addressLineElement = fixture.debugElement.query(By.css('[data-test-id="addressLine"]'));
            expect(addressLineElement).toBeFalsy();
        });

        it('should display address line if addressLine returns truthy value', () => {
            const testHostComponent = fixture.componentInstance;
            jest.spyOn(testHostComponent, 'addressLine').mockReturnValue('123 Main St, City');
            jest.spyOn(component, 'isStatusSuccess').mockReturnValue(true);

            fixture.detectChanges();

            const addressLineElement = fixture.debugElement.query(By.css('[data-test-id="addressLine"]'));
            expect(addressLineElement.nativeElement.textContent).toContain('123 Main St, City');
        });
    });
});
