

import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
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
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    jest.spyOn(ApiService.prototype, '_patchFlow')
      .mockImplementation((_, data) => of(data));
    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should toggle controls based on available data', () => {
      jest.spyOn(component as any, 'flow', 'get').mockReturnValue({
        apiCall: {
          id: 'api-call-id',
          birthDate: '25/8/1991',
        },
      });
      expect(component).toBeTruthy();
      fixture.detectChanges();
      component.ngOnInit();
      expect(formGroup.get('phone').disabled).toEqual(true);
      expect(formGroup.get('birthday').disabled).toEqual(true);
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
  });
});
