import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StudioCollapseComponent } from './collapse.component';

describe('StudioCollapseComponent', () => {
  let component: StudioCollapseComponent;
  let fixture: ComponentFixture<StudioCollapseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StudioCollapseComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudioCollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
