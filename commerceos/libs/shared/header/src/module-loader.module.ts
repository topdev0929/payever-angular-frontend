import { Compiler, Injectable, Injector, NgModuleFactory, NgModuleRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModuleLoaderService {
  constructor(private compiler: Compiler, private injector: Injector) { }

  loadModule(): Promise<NgModuleRef<any>> {
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    return import('@pe/message').then(({ PeMessageModule }) => {
      const moduleFactory = this.compiler.compileModuleAsync(PeMessageModule);

      return moduleFactory.then((factory: NgModuleFactory<any>) => {
        const moduleRef = factory.create(this.injector);

        return moduleRef;
      });
    });

  }
}
