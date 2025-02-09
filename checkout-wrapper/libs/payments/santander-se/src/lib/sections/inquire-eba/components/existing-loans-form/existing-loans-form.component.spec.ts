import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { ExistingLoansFormComponent } from './existing-loans-form.component';

describe('existing-loans-form', () => {
  let component: ExistingLoansFormComponent;
  let fixture: ComponentFixture<ExistingLoansFormComponent>;
  let formGroup: InstanceType<typeof ExistingLoansFormComponent>['formGroup'];

  beforeEach(() => {
    const fb = new FormBuilder();
    const existingLoansForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutUiTooltipModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: existingLoansForm,
        },
      ],
      declarations: [ExistingLoansFormComponent],
    });

    fixture = TestBed.createComponent(ExistingLoansFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component['formGroup'];
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof CompositeForm).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should define form group', () => {
      expect(formGroup.get('totalDebtAmountExcludingMortgages').value).toBeNull();
      expect(formGroup.get('totalDebtAmountExcludingMortgages').validator).toBeTruthy();
      expect(formGroup.get('totalMonthlyDebtCostExcludingMortgages').value).toBeNull();
      expect(formGroup.get('totalMonthlyDebtCostExcludingMortgages').validator).toBeTruthy();
    });
    it('should enforce min and max validator to the totalDebtAmountExcludingMortgages', () => {
      const totalDebtAmountExcludingMortgages = formGroup.get('totalDebtAmountExcludingMortgages');
      totalDebtAmountExcludingMortgages.setValue(1);
      expect(totalDebtAmountExcludingMortgages.valid).toBeTruthy();
      totalDebtAmountExcludingMortgages.setValue(null);
      expect(totalDebtAmountExcludingMortgages.hasError('required')).toBeTruthy();
      totalDebtAmountExcludingMortgages.setValue(-1);
      expect(totalDebtAmountExcludingMortgages.valid).toBeFalsy();
      totalDebtAmountExcludingMortgages.setValue(1_000_000);
      expect(totalDebtAmountExcludingMortgages.valid).toBeFalsy();
    });
    it('should enforce min and max validator to the totalDebtAmountExcludingMortgages', () => {
      const totalMonthlyDebtCostExcludingMortgages = formGroup.get('totalMonthlyDebtCostExcludingMortgages');
      totalMonthlyDebtCostExcludingMortgages.setValue(1);
      expect(totalMonthlyDebtCostExcludingMortgages.valid).toBeTruthy();
      totalMonthlyDebtCostExcludingMortgages.setValue(null);
      expect(totalMonthlyDebtCostExcludingMortgages.hasError('required')).toBeTruthy();
      totalMonthlyDebtCostExcludingMortgages.setValue(-1);
      expect(totalMonthlyDebtCostExcludingMortgages.valid).toBeFalsy();
      totalMonthlyDebtCostExcludingMortgages.setValue(1_000_000);
      expect(totalMonthlyDebtCostExcludingMortgages.valid).toBeFalsy();
    });
  });

  describe('ngOnInit', () => {
    it('should load tooltip icon on init', () => {
      const mockLoadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: mockLoadIcons,
        },
      };
      component.ngOnInit();
      expect(mockLoadIcons).toHaveBeenCalledWith(['help-24'], null, null);
    });
  });
});
