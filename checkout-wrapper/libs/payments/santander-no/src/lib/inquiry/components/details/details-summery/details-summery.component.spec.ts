import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { DetailsSummaryComponent } from './details-summery.component';

describe('DetailsSummaryComponent', () => {
  const storeHelper = new StoreHelper();
  let component: DetailsSummaryComponent;
  let fixture: ComponentFixture<DetailsSummaryComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        DetailsSummaryComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(DetailsSummaryComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render personalForm employer', () => {
      component.formData = { personalForm: { employer: 'Test Employer' } };
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.text-primary');
      expect(element.textContent).toContain('Test Employer');
    });

    it('should not render personalForm employer if not present', () => {
      component.formData = { personalForm: {} };
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.text-primary');
      expect(element).toBeNull();
    });

    it('should render debtForm totalDebt', () => {
      component.formData = { debtForm: { totalDebt: 10000 } };
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.text-primary');
      expect(element.textContent).toContain('10000');
    });

    it('should not render debtForm totalDebt if not present', () => {
      component.formData = { debtForm: {} };
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.text-primary');
      expect(element).toBeNull();
    });

    it('should render monthlyExpensesForm otherMonthlyExpenses', () => {
      component.formData = { monthlyExpensesForm: { otherMonthlyExpenses: 500 } };
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.text-primary');
      expect(element.textContent).toContain('500');
    });

    it('should not render monthlyExpensesForm otherMonthlyExpenses if not present', () => {
      component.formData = { monthlyExpensesForm: {} };
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.text-primary');
      expect(element).toBeNull();
    });
  });
});
