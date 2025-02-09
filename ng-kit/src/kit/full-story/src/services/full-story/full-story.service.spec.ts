// tslint:disable max-classes-per-file

import { FullStoryService } from './full-story.service';
import { FullStoryConfigInterface, FullStoryUserInfoInterface } from '../../interfaces';
import { FULL_STORY_HOST, FULL_STORY_NAMESPACE_DEFAULT } from '../../settings';

describe('FullStoryService', () => {
  let fakeWindow: any;
/*
  const fsNamespaceKey: string = '_fs_namespace';
  const fsDebugKey: string = '_fs_debug';
  const fsHostKey: string = '_fs_host';
  const fsOrgKey: string = '_fs_org';
  const fsOutScriptKey: string = '_fs_is_outer_script';
  const testEmail: string = 'test-some@email.com';

  beforeEach(() => {
    fakeWindow = {};
  });

  describe('via FullStoryServiceWithStubRequire', () => {
    let service: FullStoryServiceWithRequireStub;

    beforeEach(() => {
      service = new FullStoryServiceWithRequireStub(fakeWindow as Window);
    });

    it('should create service instance and not initialize script with constructor', () => {
      expect(service).toBeDefined();
      expect(service.initializeFullstory).not.toHaveBeenCalled();
    });

    it('should initialize with config', () => {
      spyOn(console, 'log');
      const config: FullStoryConfigInterface = {
        forceEnable: true,
        debugMode: true,
        orgId: 'test-org-ID',
        fsNamespace: 'fsTestNamespace'
      };
      service.init(config);
      expect(service.initializeFullstory).toHaveBeenCalledTimes(1);
      expect(fakeWindow[fsNamespaceKey]).toBe(config.fsNamespace);
      expect(fakeWindow[fsOrgKey]).toBe(config.orgId);
      expect(fakeWindow[fsHostKey]).toBe(FULL_STORY_HOST);
      expect(fakeWindow[fsDebugKey]).toBe(config.debugMode);

      expect(config.debugMode).toBe(true, 'self-test');
      expect(
      expect(
      expect(
    });

    it('should not write log if not in debug mode (by default)', () => {
      spyOn(console, 'log');
      const config: FullStoryConfigInterface = {
        forceEnable: true,
        orgId: 'test-org-ID',
      };
      expect(config.debugMode).toBeUndefined('self-test');
      service.init(config);
      expect(service.initializeFullstory).toHaveBeenCalledTimes(1);
      expect(
    });

    it('should not write log if not in debug mode', () => {
      spyOn(console, 'log');
      const config: FullStoryConfigInterface = {
        forceEnable: true,
        debugMode: false,
        orgId: 'test-org-ID',
      };
      expect(config.debugMode).toBe(false);
      service.init(config);
      expect(service.initializeFullstory).toHaveBeenCalledTimes(1);
      expect(config.debugMode).toBe(false, 'self-test');
      expect(
    });

    it('should not initialize if namespace confict detected', () => {
      const fsNamespace: string = 'fsTestNamespaceConflict';
      fakeWindow[fsNamespace] = {};
      const config: FullStoryConfigInterface = {
        fsNamespace,
        forceEnable: true,
        orgId: 'test-org-ID',
      };
      service.init(config);
      expect(service.initializeFullstory).not.toHaveBeenCalled();
    });

    it('should not initialize if not forced enable on test stage', () => {
      const config: FullStoryConfigInterface = {
        forceEnable: false,
        orgId: 'test-org-ID',
      };
      expect(fakeWindow.self).toBe(fakeWindow.top, 'self-test');
      expect(config.forceEnable).toBeFalsy('self-test');
      service.init(config);
      expect(service.initializeFullstory).not.toHaveBeenCalled();
    });

    it('should emulate initialization inside iframe and set special flag', () => {
      fakeWindow.self = fakeWindow;
      fakeWindow.top = {};
      expect(fakeWindow.self).not.toBe(fakeWindow.top, 'self-test');
      const config: FullStoryConfigInterface = {
        forceEnable: true,
        orgId: 'test-org-ID',
      };
      expect(fakeWindow[fsOutScriptKey]).toBeUndefined();
      service.init(config);
      expect(service.initializeFullstory).toHaveBeenCalled();
      expect(fakeWindow[fsOutScriptKey]).toBe(true);
    });

    it('should emulate an error on iframe detection', () => {
      fakeWindow.self = fakeWindow;
      Object.defineProperty(fakeWindow, 'top', {
        get(): any {
          throw new Error('[FullStoryService Test] Access to top denied');
        }
      });
      const config: FullStoryConfigInterface = {
        forceEnable: true,
        orgId: 'test-org-ID',
      };
      try {
        service.init(config);
      } catch (e) {
        expect(e).toBeFalsy('No errors expected');
      }
      expect(service.initializeFullstory).toHaveBeenCalled();
      expect(fakeWindow[fsOutScriptKey]).toBe(true);
    });

    it('should not identify if not inited', () => {
      fakeWindow[FULL_STORY_NAMESPACE_DEFAULT] = jasmine.createSpyObj('fs', ['identify']);
      expect(service.initializeFullstory).not.toHaveBeenCalled();
      service.identify(testEmail);
      expect(fakeWindow[FULL_STORY_NAMESPACE_DEFAULT].identify).not.toHaveBeenCalled();
    });

    it('should identify() user with email after init()', () => {
      const fsNamespace: string = FULL_STORY_NAMESPACE_DEFAULT;
      service.init({
        forceEnable: true,
        fsNamespace,
        orgId: 'test-org-id'
      });
      expect(service.initializeFullstory).toHaveBeenCalled();
      fakeWindow[fsNamespace] = jasmine.createSpyObj('fs', ['identify']);
      service.identify(testEmail);
      expect(fakeWindow[fsNamespace].identify).toHaveBeenCalledTimes(1);
      expect(fakeWindow[fsNamespace].identify).toHaveBeenCalledWith(testEmail, undefined);
    });

    it('should needForceReload() to be true after init()', () => {
      const fsNamespace: string = FULL_STORY_NAMESPACE_DEFAULT;
      expect(service.needForceReload()).toBe(false);
      service.init({
        forceEnable: true,
        fsNamespace,
        orgId: 'test-org-id'
      });
      expect(service.initializeFullstory).toHaveBeenCalled();
      expect(service.needForceReload()).toBe(false);
      fakeWindow[fsNamespace] = jasmine.createSpyObj('fs', ['identify']);
      service.identify(testEmail);
      expect(fakeWindow[fsNamespace].identify).toHaveBeenCalled();
      expect(service.needForceReload()).toBe(true);
    });

    it('should not identify() user with email after init() if namespace is broken', () => {
      const fsNamespace: string = FULL_STORY_NAMESPACE_DEFAULT;
      service.init({
        fsNamespace,
        forceEnable: true,
        orgId: 'test-org-id'
      });
      expect(service.initializeFullstory).toHaveBeenCalled();
      const otherFsNamespace: string = `${fsNamespace}-test`;
      fakeWindow[otherFsNamespace] = jasmine.createSpyObj('fs', ['identify']);
      service.identify(testEmail);
      expect(fakeWindow[otherFsNamespace].identify).not.toHaveBeenCalled();
    });

    it('should identify() user with email and additional userInfo after init()', () => {
      const fsNamespace: string = FULL_STORY_NAMESPACE_DEFAULT;
      const userInfo: FullStoryUserInfoInterface = {
        additionalKey: 'test-additonal-key',
        displayName: 'Test User',
      };
      service.init({
        forceEnable: true,
        fsNamespace,
        orgId: 'test-org-id'
      });
      expect(service.initializeFullstory).toHaveBeenCalled();
      fakeWindow[fsNamespace] = jasmine.createSpyObj('fs', ['identify']);
      service.identify(testEmail, userInfo);
      expect(fakeWindow[fsNamespace].identify).toHaveBeenCalledTimes(1);
      expect(fakeWindow[fsNamespace].identify).toHaveBeenCalledWith(testEmail, userInfo);
    });
  });

  describe('via FullStoryServiceWithAllowedEnable', () => {
    let service: FullStoryServiceAllowedEnable;

    beforeEach(() => {
      service = new FullStoryServiceAllowedEnable(fakeWindow);
    });

    it('should initialize without config', () => {
      service.init();
      service['isIframeInSameDomain']();
      expect(service.initializeFullstory).toHaveBeenCalled();
      expect(service.isEnabledOnCurrentStage).toHaveBeenCalled();
    });

    it('should identify() inside iframe', () => {
      const fsNamespace: string = 'iframe-namespace';
      const domain: string = '[test-fake-top-window-domain]';
      const fakeTopWindow: any = {
        document: { domain },
        [fsNamespace]: jasmine.createSpyObj('fs', ['identify'])
      };
      Object.assign(fakeWindow, {
        document: { domain },
        top: fakeTopWindow,
        self: fakeWindow
      });

      service.init({
        fsNamespace,
        orgId: '[test-org-id]'
      });
      expect(fakeWindow[fsOutScriptKey]).toBe(true);
      expect(service.initializeFullstory).toHaveBeenCalled();
      service.identify(testEmail);
      expect(fakeTopWindow[fsNamespace].identify).toHaveBeenCalled();
      expect(fakeTopWindow[fsNamespace].identify).toHaveBeenCalledWith(testEmail, undefined);
    });

    it('should not identify() inside iframe on CORS failure', () => {
      const fsNamespace: string = 'iframe-namespace';
      const domain: string = '[test-fake-top-window-domain]';
      const fakeTopWindow: any = {
        document: {},
        [fsNamespace]: jasmine.createSpyObj('fs', ['identify'])
      };
      Object.defineProperty(fakeTopWindow.document, 'domain', {
        get(): string {
          throw new Error('Emulated CORS error');
        }
      });
      Object.assign(fakeWindow, {
        document: { domain },
        top: fakeTopWindow,
        self: fakeWindow
      });

      try {
        service.init({
          fsNamespace,
          orgId: '[test-org-id]'
        });
        expect(fakeWindow[fsOutScriptKey]).toBe(true);
        expect(service.initializeFullstory).toHaveBeenCalled();
        service.identify(testEmail);
        expect(fakeTopWindow[fsNamespace].identify).not.toHaveBeenCalled();
      } catch (e) {
        expect(e).toBeFalsy('Should catch emulaged error');
      }
    });
  });*/
});

class FullStoryServiceWithRequireStub extends FullStoryService {
  // Mock fullstory script loading
  initializeFullstory: () => void =
    jasmine.createSpy('initializeFullstory');
}

class FullStoryServiceAllowedEnable extends FullStoryServiceWithRequireStub {
  // Allow always enabled
  isEnabledOnCurrentStage: () => boolean =
    jasmine.createSpy('initializeFullstory').and.returnValue(true);
}
