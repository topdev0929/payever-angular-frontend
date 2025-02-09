import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionsComponent } from './rule-actions.component';

describe('RuleActionsComponent', () => {
  let component: RuleActionsComponent;
  let fixture: ComponentFixture<RuleActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
