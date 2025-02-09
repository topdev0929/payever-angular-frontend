import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonProvidersTestHelper } from '@pe/checkout/testing';
import { CommonImportsTestHelper } from '@pe/checkout/testing';

import { AbstractFinishTemplateComponent } from './abstract-finish-template-component';

@Component({
  selector: 'extends-abstract-finish-template-component',
  template: '',
})
class TestAbstractFinishTemplateComponent extends AbstractFinishTemplateComponent {}

describe('AbstractFinishTemplateComponent', () => {
  let component: TestAbstractFinishTemplateComponent;
  let fixture: ComponentFixture<TestAbstractFinishTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper()],
      declarations: [TestAbstractFinishTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestAbstractFinishTemplateComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });
});
