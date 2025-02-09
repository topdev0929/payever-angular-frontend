import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { ChooseRateComponent, RatesModule } from '@pe/checkout/rates';
import { PatchParams, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { RatesService } from '../../services';

import { RatesFormComponent } from './rates-form.component';


describe('rates-form', () => {
  let component: RatesFormComponent;
  let fixture: ComponentFixture<RatesFormComponent>;
  let store: Store;
  let termsForm: FormControl;
  let formGroup: InstanceType<typeof RatesFormComponent>['formGroup'];
  let getRates: jest.SpyInstance;

  beforeEach(() => {
    const fb = new FormBuilder();
    termsForm = fb.control(null, []);

    TestBed
      .overrideComponent(
        RatesFormComponent,
        {
          remove: {
            imports: [
              RatesModule,
            ],
          },
          add: {
            imports: [
              MockModule(RatesModule),
            ],
          },
        },
      )
      .configureTestingModule({
        imports: [
          ...CommonImportsTestHelper(),
        ],
        providers: [
          ...CommonProvidersTestHelper(),
          {
            provide: NgControl,
            useValue: termsForm,
          },
        ],
      });
    getRates = jest.spyOn(RatesService.prototype, 'getRates')
      .mockReturnValue(of([{
        duration: 128,
        amount: 1,
        annualPercentageRate: 0,
        interest: 2,
        interestRate: 3,
        lastMonthPayment: 4,
        monthlyPayment: 5,
        totalCreditCost: 6,
      }]));
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchParams({ embeddedMode: true }));
    fixture = TestBed.createComponent(RatesFormComponent);
    fixture.detectChanges();

    component = fixture.componentInstance;
    formGroup = (component as any).formGroup;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    describe('rates', () => {

      it('Should get on rateSelected', () => {
        const { child: chooseRate } = QueryChildByDirective(fixture, ChooseRateComponent);
        chooseRate.rateSelected.emit('128');
        expect(formGroup.value).toMatchObject({
          duration: 128,
          interest: 2,
        });
      });

      it('Should get rates', (done) => {
        const { child } = QueryChildByDirective(fixture, ChooseRateComponent);
        component.vm$.pipe(
          filter(vm => !!vm?.rates),
          take(1),
          tap(({ rates }) => {
            expect(getRates).toHaveBeenCalled();
            expect(child.rates).toEqual(rates);
            done();
          }),
        ).subscribe();
      });

      it('should handle getRates error', (done) => {
        const errorMessage = 'An error occurred';

        jest.spyOn(RatesService.prototype, 'getRates')
          .mockReturnValue(throwError({ message: errorMessage, error: 'Details about the error' }));

        component['ratesSubject$'].next();
        expect(component.errorMessage).toEqual(errorMessage);

        (component as any).rates$.subscribe((result: any) => {
          expect(result).toEqual([]);
          done();
        }, (error: string | { message: string }) => {
          done.fail(error);
        });
      });
    });

    it('should handle tryAgain', () => {
      const ratesSubjectNext = jest.spyOn(component['ratesSubject$'], 'next');
      component.errorMessage = 'some-error';
      component['tryAgain']();
      expect(component.errorMessage).toBeNull();
      expect(ratesSubjectNext).toHaveBeenCalled();
    });
  });
});

