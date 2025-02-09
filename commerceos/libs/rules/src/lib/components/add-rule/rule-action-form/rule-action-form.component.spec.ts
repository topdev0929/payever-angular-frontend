import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionPipelineComponent } from './rule-action-form.component';

describe('RuleActionPipelineComponent', () => {
  let component: RuleActionPipelineComponent;
  let fixture: ComponentFixture<RuleActionPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionPipelineComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
