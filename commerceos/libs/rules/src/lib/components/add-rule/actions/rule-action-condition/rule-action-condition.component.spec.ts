import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionConditionComponent } from './rule-action-condition.component';

describe('RuleActionConditionComponent', () => {
  let component: RuleActionConditionComponent;
  let fixture: ComponentFixture<RuleActionConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionConditionComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
