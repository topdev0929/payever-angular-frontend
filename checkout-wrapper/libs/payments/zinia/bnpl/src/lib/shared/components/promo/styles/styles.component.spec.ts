import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoStylesComponent } from './styles.component';

describe('StylesComponent', () => {
  let component: PromoStylesComponent;
  let fixture: ComponentFixture<PromoStylesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(PromoStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
