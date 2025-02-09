import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebShopBuilderInsertComponent } from './builder-insert.component';

describe('BuilderInsertComponent', () => {
  let component: PebShopBuilderInsertComponent;
  let fixture: ComponentFixture<PebShopBuilderInsertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PebShopBuilderInsertComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PebShopBuilderInsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
