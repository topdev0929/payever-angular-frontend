import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { take, tap } from 'rxjs/operators';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { BankFormComponent } from './bank-form.component';

describe('BankFormComponent', () => {
    const storeHelper = new StoreHelper();

    let component: BankFormComponent;
    let fixture: ComponentFixture<BankFormComponent>;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                NgControl,
            ],
            declarations: [
                BankFormComponent,
            ],
        }).compileComponents();

        storeHelper.setMockData();
        store = TestBed.inject(Store);

        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(BankFormComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    describe('Constructor', () => {
        it('Should check if component defined.', () => {
            expect(component).toBeDefined();
        });
    });

    describe('formGroup', () => {
        it('should have a form with the expected controls', () => {
            const formGroup = component.formGroup;
            fixture.detectChanges();

            expect(formGroup.get('bank_i_b_a_n')).toBeTruthy();
            expect(formGroup.get('bank_b_i_c')).toBeTruthy();
            expect(formGroup.get('bank_account_bank_name')).toBeTruthy();
        });

        it('should set bank_i_b_a_n as required', () => {
            const control = component.formGroup.get('bank_i_b_a_n');
            control.setValue(null);

            expect(control.hasError('required')).toBeTruthy();

            control.setValue('valid-iban');
            expect(control.hasError('required')).toBeFalsy();
        });

        it('should validate bank_i_b_a_n using ibanValidator', () => {
            const control = component.formGroup.get('bank_i_b_a_n');

            control.valueChanges.pipe(
              take(1),
              tap(() => {
                expect(control.hasError('pattern')).toBeTruthy();
              })
            ).subscribe();

            control.setValue('invalid-iban');

            control.valueChanges.pipe(
              take(1),
              tap(() => {
                expect(control.hasError('pattern')).toBeFalsy();
              })
            ).subscribe();

            control.setValue('DE89370400440532013000');

        });

        it('should set bank_b_i_c as required', () => {
            const control = component.formGroup.get('bank_b_i_c');
            control.enable();

            control.setValue(null);
            expect(control.hasError('required')).toBeTruthy();

            control.setValue('valid-bic');
            expect(control.hasError('required')).toBeFalsy();
        });

        it('should set bank_account_bank_name as required', () => {
            const control = component.formGroup.get('bank_account_bank_name');
            control.enable();

            control.setValue(null);
            expect(control.hasError('required')).toBeTruthy();

            control.setValue('valid-bank-name');
            expect(control.hasError('required')).toBeFalsy();
        });
    });

    describe('ngOnInit', () => {
        it('should enable bank_b_i_c and bank_account_bank_name based on bank_i_b_a_n value', () => {
            expect(component.formGroup.get('bank_b_i_c').enabled).toBeFalsy();
            expect(component.formGroup.get('bank_account_bank_name').enabled).toBeFalsy();

            component.formGroup.get('bank_i_b_a_n').setValue('US123456789');
            expect(component.formGroup.get('bank_b_i_c').enabled).toBeTruthy();
            expect(component.formGroup.get('bank_account_bank_name').enabled).toBeTruthy();
        });

        it('should disable bank_b_i_c and bank_account_bank_name based on bank_i_b_a_n value', () => {
            component.formGroup.get('bank_i_b_a_n').setValue('DE123456789');
            expect(component.formGroup.get('bank_b_i_c').enabled).toBeFalsy();
            expect(component.formGroup.get('bank_account_bank_name').enabled).toBeFalsy();
        });
    });
});
