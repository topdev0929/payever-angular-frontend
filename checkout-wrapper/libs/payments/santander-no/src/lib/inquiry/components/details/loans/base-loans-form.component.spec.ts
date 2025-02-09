import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CompositeForm } from '@pe/checkout/forms';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { BaseLoansFormComponent } from './base-loans-form.component';

@Component({
    selector: 'extends-base-component',
    template: '<div></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExtendsBaseLoansFormComponent extends BaseLoansFormComponent implements OnInit {
    ngOnInit(): void {
        super.ngOnInit();
    }

    protected createForm(): void {
      this.loansForm.push(this.fb.group({
        loanAmount: [null, [Validators.required, Validators.min(0)]],
        remainingTerms: [null, [Validators.required, Validators.min(0)]],
      }));
    }
}

describe('BaseLoansFormComponent', () => {
    let fixture: ComponentFixture<ExtendsBaseLoansFormComponent>;
    let component: ExtendsBaseLoansFormComponent;

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
                ExtendsBaseLoansFormComponent,
            ],
        });
        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
        fixture = TestBed.createComponent(ExtendsBaseLoansFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Constructor', () => {
        it('Should create an instance', () => {
            expect(component).toBeTruthy();
            expect(component instanceof CompositeForm).toBeTruthy();
        });
    });

  describe('maxMaskFn', () => {
        it('should return the MAX_LOANS_COUNT if the input value is greater than MAX_LOANS_COUNT', () => {
          const MOCK_MAX_LOANS_COUNT = 20;
          const maxValue = MOCK_MAX_LOANS_COUNT + 5;
          const result = component.maxMaskFn(maxValue.toString());

          expect(result).toBe(MOCK_MAX_LOANS_COUNT.toString());
        });

        it('should return the same value if the input value is less than or equal to MOCK_MAX_LOANS_COUNT', () => {
          const MOCK_MAX_LOANS_COUNT = 20;
          const lesserValue = MOCK_MAX_LOANS_COUNT - 5;
          const result = component.maxMaskFn(lesserValue.toString());

          expect(result).toBe(lesserValue.toString());

          const equalValue = MOCK_MAX_LOANS_COUNT;
          const resultEqual = component.maxMaskFn(equalValue.toString());

          expect(resultEqual).toBe(equalValue.toString());
        });

        it('should return the same value if the input value is not provided', () => {
            const result = component.maxMaskFn('');
            expect(result).toBe('');
        });
    });

  describe('ngOnInit', () => {
    it('should subscribe to _count changes and update loansForm accordingly', () => {
      component['createForm']();
      component.ngOnInit();
      const countControl = component.formGroup.get('_count');

      countControl.setValue(2);
      fixture.detectChanges();

      expect(component.loansArray.length).toBe(2);

      countControl.setValue(1);
      fixture.detectChanges();

      expect(component.loansArray.length).toBe(1);
    });
  });

  describe('writeValue', () => {
    it('should set the value of the loans form group', () => {
      const mockValue: any = [];
      component.writeValue(mockValue);

      const loansFormGroupValue = component.formGroup.get('loans').value;
      expect(loansFormGroupValue).toEqual(mockValue);
    });
  });

  describe('registerOnChange', () => {
    it('should register the provided function and emit changes', fakeAsync(() => {
      component['createForm']();

      component['onTouch'] = jest.fn();
      const mockChangeFn = jest.fn();
      component.registerOnChange(mockChangeFn);

      const loansFormGroup = component.formGroup.get('loans');
      loansFormGroup.setValue([{ loanAmount: 500, remainingTerms: 6 }]);

      tick();

      expect(mockChangeFn).toHaveBeenCalledWith([{ loanAmount: 500, remainingTerms: 6 }]);
    }));
  });

  describe('trackByIdx', () => {
    it('should return the index as the tracking identifier', () => {
      const result = component.trackByIdx(3);
      expect(result).toBe(3);
    });
  });
});

