import { MaskLeftPipe } from './mask-left.pipe';

describe('SDK: Form utils module: MaskLeftPipe', () => {

  let pipe: MaskLeftPipe;

  beforeEach(() => {
    pipe = new MaskLeftPipe();
  });

  it('should work with default params', () => {
    expect(pipe.transform('1-23456789')).toEqual('*-****6789');
    expect(pipe.transform('12345')).toEqual('*2345');
    expect(pipe.transform('1234')).toEqual('1234');
    expect(pipe.transform('12')).toEqual('12');
    expect(pipe.transform('')).toEqual('');
  });
  it('should work with custom params', () => {
    expect(pipe.transform('1-23456789', 99, '.')).toEqual('1-23456789');
    expect(pipe.transform('1-23456789', 0, '.')).toEqual('.-........');
    expect(pipe.transform('1-23456789', 3, '.')).toEqual('.-.....789');
    expect(pipe.transform('1-23456789', 1, '.')).toEqual('.-.......9');
    expect(pipe.transform('', 99, '.')).toEqual('');
  });
});
