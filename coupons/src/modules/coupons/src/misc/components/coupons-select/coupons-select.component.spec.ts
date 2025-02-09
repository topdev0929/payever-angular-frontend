import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PeCouponsSelectComponent } from './coupons-select.component';

describe('PeCouponsSelectComponent', () => {

  let fixture: ComponentFixture<PeCouponsSelectComponent>;
  let component: PeCouponsSelectComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [PeCouponsSelectComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsSelectComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should register on change', () => {

    const fn = () => { };

    component.onChange('value');
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

    const value = 'test';
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    component.writeValue(value);

    expect(component.selectedOption).toEqual(value);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should tranck option', () => {

    const option = {
      title: 'Title',
      value: 'test',
    };

    expect(component.trackOption(0, option)).toEqual(option.value);

  });

});
