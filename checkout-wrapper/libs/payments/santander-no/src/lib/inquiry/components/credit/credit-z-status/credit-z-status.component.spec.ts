import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { CreditZStatusComponent } from './credit-z-status.component';

describe('CreditZStatusComponent', () => {
  const storeHelper = new StoreHelper();
  let component: CreditZStatusComponent;
  let fixture: ComponentFixture<CreditZStatusComponent>;
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
        CreditZStatusComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(CreditZStatusComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });

    it('should initialize inputs', () => {
      component.title = 'Test Title';
      component.note = 'Test Note';
      component.passed = true;
      component.faded = false;

      fixture.detectChanges();

      const statusWrap = fixture.nativeElement.querySelector('.status-wrap');
      const titleElement = statusWrap.querySelector('.large-2');
      const noteElement = statusWrap.querySelector('.small-1');

      expect(titleElement.textContent).toContain('Test Title');
      expect(noteElement.innerHTML).toContain('Test Note');
    });
  });

  describe('Icon Rendering', () => {
    it('should render success icon if passed is true', () => {
      component.passed = true;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.icon-wrap use');
      expect(icon.getAttribute('xlink:href')).toContain('#icon-register-done-32');
    });

    it('should render default icon if passed is false', () => {
      component.passed = false;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.icon-wrap use');
      expect(icon.getAttribute('xlink:href')).toContain('#icon-register-32');
    });
  });

  describe('Faded Class', () => {
    it('should apply faded class when faded is true', () => {
      component.faded = true;
      fixture.detectChanges();

      const statusWrap = fixture.nativeElement.querySelector('.status-wrap');
      expect(statusWrap.classList.contains('faded')).toBe(true);
    });

    it('should not apply faded class when faded is false', () => {
      component.faded = false;
      fixture.detectChanges();

      const statusWrap = fixture.nativeElement.querySelector('.status-wrap');
      expect(statusWrap.classList.contains('faded')).toBe(false);
    });
  });


  describe('Template Rendering', () => {
    it('should render title and note in the template', () => {
      component.title = 'Test Title';
      component.note = 'Test Note';
      fixture.detectChanges();

      const statusWrap = fixture.nativeElement.querySelector('.status-wrap');
      const titleElement = statusWrap.querySelector('.large-2');
      const noteElement = statusWrap.querySelector('.small-1');

      expect(titleElement.textContent).toContain('Test Title');
      expect(noteElement.innerHTML).toContain('Test Note');
    });

    it('should render default icon when passed is false', () => {
      component.passed = false;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.icon-wrap use');
      expect(icon.getAttribute('xlink:href')).toContain('#icon-register-32');
    });
  });
});
