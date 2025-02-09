import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject, of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, clearValidators } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';

import { DetailsFormComponent } from './details-form.component';

describe('details-form', () => {
  let component: DetailsFormComponent;
  let fixture: ComponentFixture<DetailsFormComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof DetailsFormComponent>['formGroup'];
  const submit$ = new Subject<number>();

  const phone = '+491711234567';
  const birthDate = new Date('1/1/1991').toString();

  beforeEach(() => {
    const fb = new FormBuilder();
    const financeDetailsForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: financeDetailsForm,
        },
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: PaymentSubmissionService, useValue: submit$ },
      ],
      declarations: [
        DetailsFormComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow({
      ...flowWithPaymentOptionsFixture(),
      billingAddress: {
        ...flowWithPaymentOptionsFixture().billingAddress,
        phone,
      },
      apiCall: {
        ...flowWithPaymentOptionsFixture().apiCall,
        birthDate,
      },
    }));
    jest.spyOn(ApiService.prototype, '_patchFlow')
      .mockImplementation((_, data) => of(data));
    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create component', () => {
      expect(component).toBeDefined();
    });
  });

  describe('component', () => {
    it('should emit submitted if valid', (done) => {
      clearValidators(formGroup);
      component.submitted.subscribe((v) => {
        expect(v).toEqual(formGroup.value);
        done();
      });
      submit$.next(Date.now());
    });

    it('should load icons on init', () => {
      const mockLoadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: mockLoadIcons,
        },
      };
      component.ngOnInit();
      expect(mockLoadIcons).toHaveBeenCalled();
    });

    it('should trigger birthdayDisabled$ and phoneDisabled$ on init', () => {
      const birthdayDisabledNext = jest.spyOn(component.birthdayDisabled$, 'next');
      const phoneDisabledNext = jest.spyOn(component.phoneDisabled$, 'next');
      component.ngOnInit();
      expect(birthdayDisabledNext).toHaveBeenCalled();
      expect(phoneDisabledNext).toHaveBeenCalled();
    });

    it('should checkAndDisableControl return true', () => {
      const control = new FormControl('test');
      const markAllAsTouched = jest.spyOn(control, 'markAllAsTouched');
      const updateValueAndValidity = jest.spyOn(control, 'updateValueAndValidity');
      jest.spyOn(control, 'valid', 'get').mockReturnValue(true);

      expect(component['checkAndDisableControl'](control)).toBeTruthy();
      expect(markAllAsTouched).toHaveBeenCalled();
      expect(updateValueAndValidity).toHaveBeenCalled();
    });
  });
});

