import { APP_INITIALIZER, NgModule, Optional, SkipSelf } from '@angular/core';

import { AuthModule } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigLoaderService } from '@pe/ng-kit/modules/environment-config';

export const getEnvironment = (configLoader: EnvironmentConfigLoaderService): () => Promise<boolean> => {
  return () => configLoader.loadEnvironmentConfig().toPromise();
};

@NgModule({
  imports: [AuthModule.forRoot()],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: getEnvironment,
      deps: [EnvironmentConfigLoaderService],
      multi: true,
    },
  ],
})
export class NewCoreModule {
  constructor(@Optional() @SkipSelf() parentModule: NewCoreModule) {
    if (parentModule) {
      throw new Error('CoreModule has already been loaded. Import Core modules in the AppModule only.');
    }
  }
}
