import { BooleanPipe } from './boolean.pipe';
import { TranslateStubService } from '../../../i18n';

describe('BooleanPipe', () => {
  let pipe: BooleanPipe;

  const TRULY_VALUE_TRANSLATION: string = 'ng_kit.forms.labels.yes';
  const FALSY_VALUE_TRANSLATION: string = 'ng_kit.forms.labels.no';

  beforeEach(() => {
    pipe = new BooleanPipe(new TranslateStubService() as any);
  });

  it('should accept truly value', () => {
    expect(pipe.transform(true as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform(1 as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform(-1 as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform(Infinity as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform(-Infinity as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform('string' as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform({} as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform([] as any)).toBe(TRULY_VALUE_TRANSLATION);
    expect(pipe.transform(new Date() as any)).toBe(TRULY_VALUE_TRANSLATION);
  });

  it('should accept falsy value', () => {
    expect(pipe.transform(false as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(0 as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(-0 as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(NaN as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(null as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform('' as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(`` as any)).toBe(FALSY_VALUE_TRANSLATION);
    // tslint:disable-next-line quotemark
    expect(pipe.transform("" as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(undefined as any)).toBe(FALSY_VALUE_TRANSLATION);
    expect(pipe.transform(document.all as any)).toBe(FALSY_VALUE_TRANSLATION);
  });

});
