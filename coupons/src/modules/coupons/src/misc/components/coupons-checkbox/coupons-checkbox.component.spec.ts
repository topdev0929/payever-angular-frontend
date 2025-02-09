import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PeCouponsCheckboxComponent } from './coupons-checkbox.component';

describe('PeCouponsCheckboxComponent', () => {

  let fixture: ComponentFixture<PeCouponsCheckboxComponent>;
  let component: PeCouponsCheckboxComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [PeCouponsCheckboxComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsCheckboxComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should register on change', () => {

    const fn = () => { };

    component.onChange(true);
    component.registerOnChange(fn);

    expect(component.onChange).toEqual(fn);

  });

  it('should register on touched', () => {

    const fn = () => { };

    component.onTouched();
    component.registerOnTouched(fn as any);

    expect(component.onTouched).toEqual(fn);

  });

  it('should write value', () => {

    component.writeValue(true);
    expect(component.elementRef.nativeElement.checked).toBe(true);

    component.writeValue(false);
    expect(component.elementRef.nativeElement.checked).toBe(false);

  });

});
