import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearActionsComponent } from './clear-actions.component';

describe('ClearActionsComponent', () => {
  let component: ClearActionsComponent;
  let fixture: ComponentFixture<ClearActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClearActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
