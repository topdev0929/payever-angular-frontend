import { isDevMode } from '@angular/core';

import { ErrorHandlerConfig } from '../models';

export const DEFAULT_ERROR_HANDLER_CONFIG: ErrorHandlerConfig = {
    isDebugMode() {
        return isDevMode();
    },
};
