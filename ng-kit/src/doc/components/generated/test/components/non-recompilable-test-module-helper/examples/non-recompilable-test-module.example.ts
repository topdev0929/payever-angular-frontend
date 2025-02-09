import { ComponentFixture, TestBed } from '@angular/core/testing';

import { nonRecompilableTestModuleHelper, overrideChangeDetectionStrategyHelper } from '@pe/ng-kit/modules/test';
import { TranslateStubService } from '@pe/ng-kit/modules/translate';

import { AwesomePayeverComponent, AwesomePayeverModule } from '../';

describe('AwesomePayeverComponent', () => {
  let component: AwesomePayeverComponent;
  let fixture: ComponentFixture<AwesomePayeverComponent>;

  // That code also includes asynchronous beforeAll() callback with provided module setup
  // and afterAll() callback for clearing TestBed.
  nonRecompilableTestModuleHelper(
    {
      imports: [
        AwesomePayeverModule
      ],
      providers: [
        TranslateStubService.provide()
      ]
      // ...other module declaration
    },
    // Use this optional callback after module definition and
    // before components complication, if neccessary.
    () => {
      TestBed
        .overrideComponent(AwesomePayeverComponent, overrideChangeDetectionStrategyHelper(AwesomePayeverComponent));
    }
  );

  // Usual component creation for sharing between `it` blocks.
  beforeEach(() => {
    fixture = TestBed.createComponent(AwesomePayeverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ...your best in world tests here...
});
