import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeInvoiceBuilderEditComponent } from './builder-edit.component';

describe('BuilderEditComponent', () => {
  let component: PeInvoiceBuilderEditComponent;
  let fixture: ComponentFixture<PeInvoiceBuilderEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeInvoiceBuilderEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeInvoiceBuilderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
