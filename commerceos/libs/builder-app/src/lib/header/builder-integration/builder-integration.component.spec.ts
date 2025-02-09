import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeShopBuilderIntegrationComponent } from './builder-integration.component';

describe('BuilderIntegrationComponent', () => {
  let component: PeShopBuilderIntegrationComponent;
  let fixture: ComponentFixture<PeShopBuilderIntegrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeShopBuilderIntegrationComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeShopBuilderIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});