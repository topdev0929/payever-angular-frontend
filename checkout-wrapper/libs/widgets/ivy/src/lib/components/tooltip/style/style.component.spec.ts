import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipStyleComponent } from './style.component';

describe('style-tooltip', () => {
  let component: TooltipStyleComponent;
  let fixture: ComponentFixture<TooltipStyleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TooltipStyleComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});
