import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { FormComponent } from './form.component';

describe('FormComponent', () => {

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should call doSubmit when doSubmit$ emits', () => {

    const doSubmitSubject = new Subject<null | void>();
    const doSubmitSpy = jest.spyOn((component as any), 'doSubmit');

    component.doSubmit$ = doSubmitSubject;
    doSubmitSubject.next();

    expect(doSubmitSpy).toHaveBeenCalled();

  });

  it('should emit submitted event when doSubmit is called', () => {

    const submittedEmitSpy = jest.spyOn(component.submitted, 'emit');

    (component as any).doSubmit();

    expect(submittedEmitSpy).toHaveBeenCalled();

  });

  it('should unsubscribe from previous doSubmit$ when a new one is set', () => {

    component.doSubmit$ = new Subject<null | void>();
    const firstSubscription = component['doSubmitSubscription'];

    component.doSubmit$ = new Subject<null | void>();

    expect(firstSubscription.closed).toBeTruthy();

  });

});
