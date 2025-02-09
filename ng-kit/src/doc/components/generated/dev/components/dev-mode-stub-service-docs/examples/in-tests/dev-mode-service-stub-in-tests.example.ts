import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DevModeService, DevModeStubService } from '@pe/ng-kit/modules/dev';
import { nonRecompilableTestModuleHelper } from '@pe/ng-kit/modules/test';

@Component({
  selector: 'test-dev-mode-service-component',
})
class TestDevModeServiceComponent {
  constructor(
    public devModeService: DevModeService // <-- inject in real component like non-stub original service.
  ) { }

  writeLog(...some: string[]): void {
    if (this.devModeService.isDevMode()) { // <-- replaced Angular's `isDevMode()`
      
    }
  }
}

describe('DevModeStubService In Tests', () => {
  let devModeService: DevModeStubService;
  let component: TestDevModeServiceComponent;

  nonRecompilableTestModuleHelper({
    imports: [
      DevModeStubService.provide() // <-- inject stub here
    ],
    declarations: [
      TestDevModeServiceComponent
    ]
  });

  beforeEach(() => {
    devModeService = TestBed.get(DevModeService); // <-- inject stub here like original service
    component = TestBed.createComponent(TestDevModeServiceComponent).componentInstance;
  });

  afterEach(() => {
    devModeService.reset(); // <-- allow to reset values when need
  });

  it('should render log depend on isDevMode()', () => {
    const logValues: string[] = ['some', 'log', 'entry'];

    spyOn(console, 'log');

    devModeService.enableProdMode(); // <-- disallow logs
    component.writeLog(...logValues);
    expect(

    devModeService.enableDevMode(); // <-- disallow logs
    component.writeLog(...logValues);
    expect(
    expect(
  });
});
