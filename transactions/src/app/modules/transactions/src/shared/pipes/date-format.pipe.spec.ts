import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;
  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('if value param in not provided it should return string', () => {
    const pipeResult = pipe.transform();
    expect(typeof pipeResult).toEqual('string');
  });

  it('if passed input format and format param, date should be properly formated', () => {
    const pipeResult = pipe.transform('02-08-2019', {
      inputFormat: 'DD-MM-YYYY',
      format: 'DD/MM/YYYY',
    });
    expect(pipeResult).toBe('02/08/2019');
  });

  it('if subtract value and unit are passed, return date should me reduced by passed subtract value-unit', () => {
    const pipeResult = pipe.transform('02-08-2019', {
      inputFormat: 'DD-MM-YYYY',
      format: 'DD/MM/YYYY',
      subtract: 1,
      subtractUnit: 'day',
    });
    expect(pipeResult).toBe('01/08/2019');
  });
});
