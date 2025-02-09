import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { Store } from '@ngxs/store';
import { forkJoin, from } from 'rxjs';
import { delayWhen, switchMap, take, tap } from 'rxjs/operators';

import { DialogModule } from '@pe/checkout/dialog';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { TermsDTO } from '../../../shared';

import { TermsFormComponent } from './terms-form.component';

describe('terms-form', () => {
  let component: TermsFormComponent;
  let fixture: ComponentFixture<TermsFormComponent>;
  let store: Store;
  let termsForm: FormControl;
  let formGroup: InstanceType<typeof TermsFormComponent>['formGroup'];
  let loader: HarnessLoader;

  beforeEach(() => {
    const fb = new FormBuilder();
    termsForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        DialogModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: termsForm,
        },
      ],
      declarations: [
        TermsFormComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(TermsFormComponent);
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

  describe('terms-form', () => {
    const terms: TermsDTO = {
      consents: [
        {
          label: 'hidden consent',
          required: true,
          documentId: 'consents-document-id',
        },
      ],
      terms: [
        {
          label: 'hidden term',
          required: true,
          documentId: 'terms-document-id',
        },
      ],
      visibleTerm: [
        {
          label: 'Term 1',
          required: true,
          documentId: 'first-document-id',
        },
      ],
    };
    it('Should create form', () => {
      fixture.componentRef.setInput('terms', terms);
      component.ngOnInit();
      expect(formGroup.value).toEqual({
        terms: [{ value: true, documentId: 'terms-document-id', merchantText: 'hidden term' }],
        consents: [{ value: true, documentId: 'consents-document-id', merchantText: 'hidden consent' }],
        visibleTerm: [{ value: false, documentId: 'first-document-id', merchantText: 'Term 1' }],
      });
    });

    it('Should hide terms and consents forms', () => {
      expect(component.hiddenTerms).toEqual({
        terms: true,
        consents: true,
      });
      fixture.componentRef.setInput('terms', terms);
      component.ngOnInit();
      fixture.detectChanges();

      return from(loader.getAllHarnesses(MatCheckboxHarness.with({
        label: /hidden.*/,
      }))).pipe(
        take(1),
        tap((checkboxes) => {
          expect(checkboxes.length).toBe(2);
        }),
        switchMap(checkboxes => forkJoin(checkboxes.map(checkbox => checkbox.getLabelText()))),
        tap((labels) => {
          expect(labels).toEqual([
            'hidden consent',
            'hidden term',
          ]);
        }),
      ).toPromise();
    });

    it('show visible terms', () => {
      fixture.componentRef.setInput('terms', terms);
      component.ngOnInit();
      fixture.detectChanges();

      expect(formGroup.valid).toEqual(false);

      return from(loader.getAllHarnesses(MatCheckboxHarness)).pipe(
        take(1),
        tap((checkboxes) => {
          expect(checkboxes.length).toBe(3);
        }),
        delayWhen(checkboxes => forkJoin(checkboxes.map(checkbox => checkbox.check()))),
        tap(() => {
          expect(formGroup.valid).toEqual(true);
        }),
        switchMap(checkboxes => forkJoin(checkboxes.map(checkbox => checkbox.getLabelText()))),
        tap((labels) => {
          expect(labels).toEqual([
            'hidden consent',
            'hidden term',
            'Term 1',
          ]);
        }),
      ).toPromise();
    });

    it('should registerOnChange call callback fn', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);

      fixture.componentRef.setInput('terms', terms);
      component.ngOnInit();

      expect(mockFn).toHaveBeenCalledWith(component.formGroup.value);
    });

    it('should call onTouch method', () => {
      const mockFn = jest.fn();
      component['onTouch'] = mockFn;
      component.registerOnChange(mockFn);

      fixture.componentRef.setInput('terms', terms);
      component.ngOnInit();

      expect(mockFn).toHaveBeenCalled();
    });
  });
});

