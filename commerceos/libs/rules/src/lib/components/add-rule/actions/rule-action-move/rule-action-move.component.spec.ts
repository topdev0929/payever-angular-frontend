import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionMoveComponent } from './rule-action-move.component';

describe('RuleActionMoveComponent', () => {
  let component: RuleActionMoveComponent;
  let fixture: ComponentFixture<RuleActionMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionMoveComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
