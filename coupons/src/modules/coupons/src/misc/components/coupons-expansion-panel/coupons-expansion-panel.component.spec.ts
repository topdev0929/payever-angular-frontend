import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PeCouponsExpansionPanelComponent } from './coupons-expansion-panel.component';

describe('PeCouponsExpansionPanelComponent', () => {

  let fixture: ComponentFixture<PeCouponsExpansionPanelComponent>;
  let component: PeCouponsExpansionPanelComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [PeCouponsExpansionPanelComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsExpansionPanelComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should toggle', () => {

    component.isOpen = false;
    component.toggle();

    expect(component.isOpen).toBe(true);

  });

});
