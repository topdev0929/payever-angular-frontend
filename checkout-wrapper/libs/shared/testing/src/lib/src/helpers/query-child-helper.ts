import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export const QueryChildByDirective = <T extends Type<any>>(fixture: ComponentFixture<unknown>, directive: T,) => {
  expect(fixture).toBeTruthy();

  const childEl = fixture.debugElement.query(By.directive(directive));
  expect(childEl).toBeTruthy();

  const child: InstanceType<T> = childEl.componentInstance;
  expect(child).toBeTruthy();

  return {
    childEl,
    child,
  };
};

export const ExpectNotToRenderChild = <T extends Type<any>>(fixture: ComponentFixture<unknown>, directive: T,) => {
  expect(fixture).toBeTruthy();

  const childEl = fixture.debugElement.query(By.directive(directive));
  expect(childEl).toBeFalsy();
};
