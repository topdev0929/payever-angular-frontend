import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeSiteBuilderEditComponent } from './builder-edit.component';

describe('PeSiteBuilderEditComponent', () => {
  let component: PeSiteBuilderEditComponent;
  let fixture: ComponentFixture<PeSiteBuilderEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeSiteBuilderEditComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeSiteBuilderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
