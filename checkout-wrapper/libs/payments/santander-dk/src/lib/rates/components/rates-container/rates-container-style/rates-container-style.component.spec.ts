import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { RatesContainerStylesComponent } from './rates-container-style.component';

describe('RatesContainerStylesComponent', () => {

  let component: RatesContainerStylesComponent;
  let fixture: ComponentFixture<RatesContainerStylesComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(),
      ],
      declarations: [
        RatesContainerStylesComponent,
      ],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(RatesContainerStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();

  });

});
