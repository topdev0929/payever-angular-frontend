import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PeCouponsFormFieldComponent } from './coupons-form-field.component';

describe('PeCouponsFormFieldComponent', () => {

  let fixture: ComponentFixture<PeCouponsFormFieldComponent>;
  let component: PeCouponsFormFieldComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [PeCouponsFormFieldComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsFormFieldComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng after view init', () => {

    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    component.ngAfterViewInit();

    expect(component.showPrefix).toBe(false);
    expect(component.showSuffix).toBe(false);
    expect(component.showSubscript).toBe(false);

  });

});
