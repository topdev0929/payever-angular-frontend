import { Injectable } from '@angular/core';
import { assign } from 'lodash-es';

import { EnvironmentConfigService } from '../../../../environment-config';
import {
  FULL_STORY_NAMESPACE_DEFAULT,
  FULL_STORY_HOST
} from '../../settings';
import { FullStoryConfigInterface, FullStoryUserInfoInterface } from '../../interfaces';

@Injectable()
export class FullStoryService {

  private debugMode: boolean = false;
  private forceReload: boolean = false;
  private isEnabled: boolean = false;
  private fsNamespace: string = FULL_STORY_NAMESPACE_DEFAULT;
  private window = window; // TODO replace for tests

  constructor(
    private configService: EnvironmentConfigService
  ) {}

  needForceReload(): boolean {
    // We should not show any content before force page refresh.
    // Otherwise processor gets 100% loading and we have to kill browser process.
    // This flag is used to force hide content before page refresh.
    return this.forceReload;
  }

  init(config: FullStoryConfigInterface = null): void {
    config = assign({
      debugMode: false,
      forceEnable: false,
      orgId: this.configService.getConfigConfig().fullStoryOrgId,
      fsNamespace: FULL_STORY_NAMESPACE_DEFAULT
    }, config || {});
    this.debugMode = config.debugMode || this.isLogEnabledOnCurrentStage();
    this.isEnabled = !!config.orgId;
    this.fsNamespace = config.fsNamespace || FULL_STORY_NAMESPACE_DEFAULT;

    if (!this.isEnabled) {
      this.log('FullStory isn\'t enabled');
      return;
    }

    if (this.fsNamespace in this.window) {
      this.log('FullStory namespace conflict. Please set window["_fs_namespace"] or provide fsNamespace with init() config.');
      console.warn('FullStory namespace conflict. Please set window["_fs_namespace"] or provide fsNamespace with init() config.');
      return;
    }

    this.log('Start initialization call');

    if (this.isRunInIframe()) {
      this.log('Running in iframe');
      this.window['_fs_is_outer_script'] = true;
    }

    this.window['_fs_debug'] = this.debugMode;
    this.window['_fs_host'] = FULL_STORY_HOST;
    this.window['_fs_org'] = config.orgId;
    this.window['_fs_namespace'] = this.fsNamespace;

    this.initializeFullstory();

    this.log('Finished initialization call');
  }

  // Official documentation about FS.identify():
  // http://help.fullstory.com/develop-js/identify
  identify(email: string, userInfo?: FullStoryUserInfoInterface): void {
    if (!this.isEnabled) {
      this.log('FullStory isn\'t enabled');
      return;
    }

    let result: any;
    if (
      this.window[this.fsNamespace]
      && this.window[this.fsNamespace].identify
    ) {
      this.log('Started identification on current window', email, userInfo);
      result = this.window[this.fsNamespace].identify(email, userInfo);
      this.forceReload = true;
      this.log('Finished identification with result', result);
    } else if (
      this.isIframeInSameDomain()
      && this.window.top[this.fsNamespace]
      && this.window.top[this.fsNamespace].identify
    ) {
      // If we are in iframe and running in same domain
      this.log('Running FullStory "identify()" in top window!');
      result = this.window.top[this.fsNamespace].identify(email, userInfo);
      this.forceReload = true;
      this.log('Finished identification with result', result);
    } else {
      this.log('Error: No FS object loaded for Full Story plugin.');
      return;
    }
  }

  // The method is protected to allow mock it on tests
  protected initializeFullstory: () => void =
    () => {
      require('./full-story.js');
    }

  private isRunInIframe(): boolean {
    try {
      return this.window.self !== this.window.top;
    } catch (e) {
      return true;
    }
  }

  private isIframeInSameDomain(): boolean {
    try {
      return this.isRunInIframe() && this.window.self.document.domain === this.window.top.document.domain;
    } catch (e) {
      return false;
    }
  }

  private log(text: string, ...optionalParams: any[]): void {
    if (this.debugMode) {
      // tslint:disable-next-line no-console
      
    }
  }

  private isLogEnabledOnCurrentStage(): boolean {
    return window.location.hostname === 'localhost';
  }
}
