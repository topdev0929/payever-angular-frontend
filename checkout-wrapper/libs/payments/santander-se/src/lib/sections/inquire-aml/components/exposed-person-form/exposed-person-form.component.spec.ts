


import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import { Store } from '@ngxs/store';
import { MockComponent } from 'ng-mocks';
import { from } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

import * as FormUtils from '@pe/checkout/form-utils';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentTextComponent } from '@pe/checkout/ui/payment-text';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';

import { ExposedPersonFormComponent } from './exposed-person-form.component';

describe('exposed-person-form', () => {
  let component: ExposedPersonFormComponent;
  let fixture: ComponentFixture<ExposedPersonFormComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof ExposedPersonFormComponent>['formGroup'];
  let loader: HarnessLoader;

  beforeEach(() => {
    const fb = new FormBuilder();
    const exposedPersonForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: exposedPersonForm,
        },
      ],
      declarations: [
        ExposedPersonFormComponent,
        MockComponent(PaymentTextComponent),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(ExposedPersonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component.formGroup;
    loader = TestbedHarnessEnvironment.loader(fixture);
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
    it('should use Yes/No on mat-select', () => {
      FormUtils.YesNoOptions[0].label = 'Yes';
      FormUtils.YesNoOptions[1].label = 'No';

      return from(loader.getHarness(MatSelectHarness)).pipe(
        delayWhen(loader => from(loader.open())),
        switchMap(select => from(select.getOptions())),
        tap((options) => { expect(options).toHaveLength(2) }),
        tap(async (options) => {
          const optionsText = options.map(async option => await option.getText());
          expect(await Promise.all(optionsText)).toEqual(['Yes', 'No']);
        })
      ).toPromise();
    });


    it('should require politicallyExposedPerson', () => {
      const politicallyExposedPerson = formGroup.get('politicallyExposedPerson');
      expect(politicallyExposedPerson).toBeTruthy();
      politicallyExposedPerson.setValue(null);
      expect(politicallyExposedPerson.valid).toBe(false);
    });
  });
});

