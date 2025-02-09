import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionTypePickerComponent } from './option-type-picker.component';

describe('OptionTypePickerComponent', () => {
  let component: OptionTypePickerComponent;
  let fixture: ComponentFixture<OptionTypePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionTypePickerComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionTypePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
