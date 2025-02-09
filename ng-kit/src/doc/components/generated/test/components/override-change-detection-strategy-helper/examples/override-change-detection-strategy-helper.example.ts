import { TestBed } from '@angular/core/testing';

import { TestingComponent } from './';
import { overrideChangeDetectionStrategyHelper } from '@pe/ng-kit/modulestest';

TestBed
  .configureTestingModule({
    declarations: [TestingComponent]
  })
  .overrideComponent(
    TestingComponent,
    overrideChangeDetectionStrategyHelper(TestingComponent)
  );
