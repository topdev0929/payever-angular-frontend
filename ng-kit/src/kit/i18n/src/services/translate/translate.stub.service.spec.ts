// tslint:disable max-classes-per-file

import { Component } from '@angular/core';

import { TranslateStubService } from './translate.stub.service';
import { TranslateService } from './translate.service';
import { TestBed } from '@angular/core/testing';
import { TranslationTemplateArgs } from '../../interfaces';

describe('TranslateStubService', () => {
  describe('instance', () => {
    let service: TranslateStubService;

    beforeEach(() => {
      service = new TranslateStubService();
    });

    it('should return passed key as translated value', () => {
      let key: string;

      key = '[translation_key]';
      expect(service.translate(key)).toBe(key);

      key = '';
      expect(service.translate(key)).toBe(key);

      key = null;
      expect(service.translate(key)).toBe(key);
    });

    it('should accept "useSalt" option', () => {
      const key: string = '[translation_key]';

      const salt: string = '[salt]';
      service.useSalt = salt;
      expect(service.translate(key)).toBe(`${salt}_${key}`);
      expect(service.useSalt).toBe(salt);

      service.useSalt = true;
      expect(service.translate(key)).toContain(`_${key}`);
      expect(typeof service.useSalt).toBe('string');

      service.useSalt = false;
      expect(service.translate(key)).toContain(key);
      expect(service.useSalt).toBe(false);
    });

    it('should accept "useArgs" option', () => {
      let args: TranslationTemplateArgs;
      const key: string = '[yet_another_translation_key]';

      expect(args).toBeFalsy();
      expect(service.translate(key, args)).toBe(key);

      service.useArgs = true;
      expect(args).toBeFalsy();
      expect(service.translate(key, args)).toBe(key);

      args = { value: 'here' };
      expect(args).toBeTruthy();
      expect(service.translate(key, args)).toBe(`${key}${JSON.stringify(args)}`);

      service.useArgs = false;
      expect(args).toBeTruthy();
      expect(service.translate(key, args)).toBe(key);

      service.useArgs = true;
      service.useSalt = true;
      expect(args).toBeTruthy();
      expect(service.translate(key, args)).toBe(`${service.useSalt}_${key}${JSON.stringify(args)}`);
    });
  });

  describe('class', () => {
    it('should provide replacement for original TranslateService', () => {
      @Component({
        template: ''
      })
      class TestComponent {
        constructor(
          public translate: TranslateService // <-- should be original TranslateService
        ) {}
      }

      TestBed.configureTestingModule({
        declarations: [TestComponent],
        providers: [TranslateStubService.provide()]
      });

      const component: TestComponent = TestBed.createComponent(TestComponent).componentInstance;
      expect(component.translate instanceof TranslateStubService).toBe(true);
      expect(component.translate instanceof TranslateService).toBe(false);
    });
  });
});
