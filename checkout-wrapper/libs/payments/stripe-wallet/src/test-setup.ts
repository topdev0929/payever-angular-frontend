import 'jest-preset-angular/setup-jest';

import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';

registerLocaleData(de.default);
