import { SpinnerConfig } from './config';

describe('SpinnerConfig', () => {
  it('should provide static props', () => {
    expect(SpinnerConfig.strokeWidth).toBeDefined();
    expect(SpinnerConfig.diameter).toBeDefined();
  });
});
