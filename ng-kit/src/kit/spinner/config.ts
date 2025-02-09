import { peVariables } from '../pe-variables';

export class SpinnerConfig {
  static strokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');
  static diameter: number = peVariables.toNumber('spinnerStrokeSm');
}
