import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StudioSelectComponent } from './studio-select.component';

describe('StudioSelectComponent', () => {
  let component: StudioSelectComponent;
  let fixture: ComponentFixture<StudioSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StudioSelectComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
