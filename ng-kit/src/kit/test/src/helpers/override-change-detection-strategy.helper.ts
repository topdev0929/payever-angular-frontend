import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

// NOTE: There is not possible to use <T> for define component and return with MetadataOverride
export function overrideChangeDetectionStrategyHelper(component: any): MetadataOverride<any> {
  return {
    set: new Component({
      ...Reflect.get(component, '__annotations__')[0],
      changeDetection: ChangeDetectionStrategy.Default
    })
  };
}
