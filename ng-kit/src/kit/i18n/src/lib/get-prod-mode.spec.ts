import * as utils from '../../../common';
import * as angularUtils from '@angular/core';
import { getProdMode } from './get-prod-mode';

describe('getProdMode', () => {
  it('should call getReleaseStage and return true', () => {
    const getReleaseStageSpy: jasmine.Spy = jasmine.createSpy('getReleaseStageSpy').and.stub();
    spyOnProperty(utils, 'getReleaseStage').and.returnValue(getReleaseStageSpy);
    const isDevModeSpy: jasmine.Spy = jasmine.createSpy('isDevModeSpy').and.returnValue(false);
    spyOnProperty(angularUtils, 'isDevMode').and.returnValue(isDevModeSpy);

    const config: any = {
      isProd: 'falseortrue'
    };

    expect(getProdMode(config)).toBeTruthy();
    expect(getReleaseStageSpy.calls.count()).toBe(3);
    expect(getReleaseStageSpy).toHaveBeenCalled();
  });

  it('should not call getReleaseStage and return true', () => {
    const getReleaseStageSpy: jasmine.Spy = jasmine.createSpy('getReleaseStageSpy').and.stub();
    spyOnProperty(utils, 'getReleaseStage').and.returnValue(getReleaseStageSpy);
    const isDevModeSpy: jasmine.Spy = jasmine.createSpy('isDevModeSpy').and.returnValue(true);
    spyOnProperty(angularUtils, 'isDevMode').and.returnValue(isDevModeSpy);

    const config: any = {
      isProd: 'falseortrue'
    };

    expect(getProdMode(config)).toBeFalsy();
    expect(getReleaseStageSpy).not.toHaveBeenCalled();
  });
});
