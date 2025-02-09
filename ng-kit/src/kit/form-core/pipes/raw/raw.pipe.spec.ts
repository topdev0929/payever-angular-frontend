import { TestBed } from '@angular/core/testing';
import { SafeHtml } from '@angular/platform-browser';

import { RawPipe } from './raw.pipe';
import { nonRecompilableTestModuleHelper } from '../../../test';

describe('RawPipe', () => {
  let pipe: RawPipe;

  nonRecompilableTestModuleHelper({
    providers: [ RawPipe ]
  });

  function extractString(value: SafeHtml): string {
    return value['changingThisBreaksApplicationSecurity'] as string;
  }

  beforeEach(() => {
    pipe = TestBed.get(RawPipe);
  });

  it('should create pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should accept empty string', () => {
    const content: string = '';
    expect(extractString(pipe.transform(content))).toEqual(content);
  });

  it('should accept plain string', () => {
    const content: string = '[string]';
    expect(extractString(pipe.transform(content))).toEqual(content);
  });

  it('should accept safe HTML template', () => {
    const content: string = '<h1>Hello world</h1>';
    expect(extractString(pipe.transform(content))).toEqual(content);
  });

  it('should accept HTML template with vulnerability', () => {
    const content: string = '<script>alert("hacked!")</script>';
    expect(extractString(pipe.transform(content))).toEqual(content);
  });
});
