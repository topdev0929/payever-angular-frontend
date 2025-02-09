import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleActionEmailComponent } from './rule-action-email.component';

describe('RuleActionEmailComponent', () => {
  let component: RuleActionEmailComponent;
  let fixture: ComponentFixture<RuleActionEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleActionEmailComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleActionEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
