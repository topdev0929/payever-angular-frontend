import { LocaleFlagComponent } from './locale-flag.component';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getLangList } from '../../lib';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('LocaleFlagComponent', () => {
  let fixture: ComponentFixture<LocaleFlagComponent>;
  let component: LocaleFlagComponent;

  const availableCodes: string[] = Object.keys(getLangList());
  const localeFlagSelector: string = '.locale-flag';
  const localeFlagClassNameForCode: (code: string) => string =
    code => `locale-flag-${code}`;

  /**
   * TODO:
   * - @Input() code: string;
   */

  nonRecompilableTestModuleHelper({
    declarations: [LocaleFlagComponent]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocaleFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have no default flag', () => {
    const flag: DebugElement = fixture.debugElement.query(By.css(localeFlagSelector));
    expect(flag).toBeFalsy();
  });

  it('should render different flags', () => {
    expect(availableCodes.length).toBeGreaterThan(0, 'self-test');

    availableCodes.forEach(code => {
      component.code = code;
      fixture.detectChanges();
      const [flag, ...rest]: DebugElement[] = Array.from(fixture.debugElement.queryAll(By.css(localeFlagSelector)));
      expect(rest.length).toBe(0);
      expect(flag).toBeTruthy();
      const currentFlagClassName: string = localeFlagClassNameForCode(code);
      expect((flag.nativeElement as HTMLImageElement).className).toContain(currentFlagClassName);
    });
  });
});
