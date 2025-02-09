import { FormOptionInterface } from '@pe/checkout/types';

import { FormOptionsLabelPipe } from './form-options-label.pipe';

const nationalities: FormOptionInterface[] = [
  { label: 'Germany', value: '0' },
  { label: 'Afghanistan', value: '45' },
  { label: 'Albania', value: '31' },
  { label: 'Austria', value: '18' },
];

describe('SDK: Form utils module: FormOptionsLabelPipe', () => {

  let pipe: FormOptionsLabelPipe;

  beforeEach(() => {
    pipe = new FormOptionsLabelPipe();
  });

  it('should work with default params', () => {
    expect(pipe.transform('45', nationalities)).toEqual('Afghanistan');
    expect(pipe.transform(45, nationalities)).toEqual('Afghanistan');
    expect(pipe.transform('145', nationalities)).toEqual('---');
    expect(pipe.transform(145, nationalities)).toEqual('---');
  });
  it('should work with custom params', () => {
    expect(pipe.transform('45', nationalities, '...')).toEqual('Afghanistan');
    expect(pipe.transform(45, nationalities, '...')).toEqual('Afghanistan');
    expect(pipe.transform('145', nationalities, '...')).toEqual('...');
    expect(pipe.transform(145, nationalities, '...')).toEqual('...');
  });
});
