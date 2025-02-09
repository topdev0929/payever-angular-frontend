import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { FormComponent } from './form.component';

describe('FormComponent', () => {

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockSubject = new Subject<void | null>();

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

  it('should subscribe to new doSubmit$ subject', () => {

    const subscribeSpy = jest.spyOn(mockSubject, 'subscribe');

    component.doSubmit$ = mockSubject;

    expect(subscribeSpy).toHaveBeenCalled();

  });

  it('should unsubscribe from old doSubmit$ subject when a new one is set', () => {

    const oldSubject = new Subject<null | void>();
    const doSubmitSpy = jest.spyOn((component as any), 'doSubmit');

    component.doSubmit$ = oldSubject;
    oldSubject.next();

    doSubmitSpy.mockReset();

    component.doSubmit$ = mockSubject;

    oldSubject.next();
    expect(doSubmitSpy).not.toHaveBeenCalled();

  });

  it('should call doSubmit when doSubmit$ subject emits', () => {

    const doSubmitSpy = jest.spyOn((component as any), 'doSubmit');

    component.doSubmit$ = mockSubject;
    mockSubject.next();

    expect(doSubmitSpy).toHaveBeenCalled();

  });

  it('should doSubmit trigger submitted emit with object', () => {

    const submittedEmitSpy = jest.spyOn(component.submitted, 'emit');

    component['doSubmit']();

    expect(submittedEmitSpy).toHaveBeenCalledWith({});

  });

});
