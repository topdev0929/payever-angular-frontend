import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionListComponent } from './rule-action-list.component';

describe('RuleActionListComponent', () => {
  let component: RuleActionListComponent;
  let fixture: ComponentFixture<RuleActionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionListComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
