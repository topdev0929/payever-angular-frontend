import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { PeCouponsFormGroupComponent } from './coupons-form-group.component';

describe('PeCouponsFormGroupComponent', () => {

  let fixture: ComponentFixture<PeCouponsFormGroupComponent>;
  let component: PeCouponsFormGroupComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [PeCouponsFormGroupComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsFormGroupComponent);
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

    expect(component.showSubscript).toBe(false);
    expect(detectSpy).toHaveBeenCalled();

  });

});
