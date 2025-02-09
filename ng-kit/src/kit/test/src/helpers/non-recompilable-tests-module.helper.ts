import { TestModuleMetadata, TestBed } from '@angular/core/testing';

/**
 * supressTestingModuleRecompilation() is important workaround
 * for unit tests, which wan't redefine module for each 'it'
 * testing case, because it is our usual approach for components
 * testing.
 *
 * Sources:
 * https://github.com/angular/angular/issues/12409#issuecomment-314814671
 */

export function nonRecompilableTestModuleHelper(
    moduleConfig: TestModuleMetadata,
    whenModuleConfiguredAndNotCompiled: () => void = () => void 0
  ): void {
  const oldResetTestingModule: () => typeof TestBed = TestBed.resetTestingModule;

  beforeAll(done => (async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule(moduleConfig);
    whenModuleConfiguredAndNotCompiled();
    await TestBed.compileComponents();

    // prevent Angular from resetting testing module
    TestBed.resetTestingModule = () => TestBed;
  })().then(done).catch(done.fail));

  afterAll(() => {
    // reinstate resetTestingModule method
    TestBed.resetTestingModule = oldResetTestingModule;
    TestBed.resetTestingModule();
  });
}
