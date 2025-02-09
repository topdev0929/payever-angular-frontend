import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

import { overrideChangeDetectionStrategyHelper } from './override-change-detection-strategy.helper';

describe('overrideChangeDetectionStrategyHelper', () => {
  it('should override ChangeDetectionStrategy from OnPush to Default', () => {
    @Component({
      template: '',
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestComponent {}

    const originalMetadata: any = Reflect.get(TestComponent, '__annotations__')[0];
    expect(originalMetadata.changeDetection).toBe(ChangeDetectionStrategy.OnPush);

    const overridenMetadated: MetadataOverride<any> = overrideChangeDetectionStrategyHelper(TestComponent);
    expect(overridenMetadated.set.changeDetection).toBe(ChangeDetectionStrategy.Default);
  });
});
