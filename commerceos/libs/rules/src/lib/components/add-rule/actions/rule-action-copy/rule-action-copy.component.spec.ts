import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionCopyComponent } from './rule-action-copy.component';

describe('RuleActionCopyComponent', () => {
  let component: RuleActionCopyComponent;
  let fixture: ComponentFixture<RuleActionCopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionCopyComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
