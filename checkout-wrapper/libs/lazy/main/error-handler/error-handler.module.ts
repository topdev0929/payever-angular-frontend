import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { ApmModule } from '@elastic/apm-rum-angular';

import { DEFAULT_ERROR_HANDLER_CONFIG } from './constants';
import { ErrorHandlerConfig } from './models';
import { DefaultErrorHandlerService } from './services';
import { ERROR_HANDLER_CONFIG } from './tokens';

@NgModule({
    imports: [ ApmModule ],
    providers: [
        {
            provide: ERROR_HANDLER_CONFIG,
            useValue: DEFAULT_ERROR_HANDLER_CONFIG,
        },
        {
            provide: ErrorHandler,
            useClass: DefaultErrorHandlerService,
        },
    ],
})
export class ErrorHandlerModule {
    static withCustomConfig(
        config: ErrorHandlerConfig,
    ): ModuleWithProviders<ErrorHandlerModule> {
        return {
            ngModule: ErrorHandlerModule,
            providers: [
                {
                    provide: ERROR_HANDLER_CONFIG,
                    useValue: config,
                },
                {
                    provide: ErrorHandler,
                    useClass: DefaultErrorHandlerService,
                },
            ],

        };
    }
}
