import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeShopBuilderThemeComponent } from './builder-theme.component';

describe('BuilderThemeComponent', () => {
  let component: PeShopBuilderThemeComponent;
  let fixture: ComponentFixture<PeShopBuilderThemeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeShopBuilderThemeComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeShopBuilderThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});