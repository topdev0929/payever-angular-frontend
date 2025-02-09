import { Compiler, Injectable, Injector } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'any' })
export class PebIntegrationSnackbarService {
  constructor(private readonly compiler: Compiler, private readonly injector: Injector) {}

  async toggle(visible: boolean, content: PebIntegrationSnackbarContent): Promise<void> {
    this.lazyLoadSnackbarService().pipe(
      tap(service => service.toggle(visible, content)),
      take(1)
    ).subscribe();
  }

  private lazyLoadSnackbarService(): Observable<{
    toggle: (visible: boolean, content: PebIntegrationSnackbarContent) => void;
  }> {
    return from(import('@pe/snackbar')).pipe(
      switchMap(({ SnackbarService, SnackbarModule }) => {
        return from(this.compiler.compileModuleAsync(SnackbarModule)).pipe(
          map((factory) => {
            const moduleRef = factory.create(this.injector);
            const service = moduleRef.injector.get(SnackbarService);

            return service;
          }),
        );
      }),
    );
  }
}

interface PebIntegrationSnackbarContent {
  content: string;
  duration: number;
  iconColor: string;
  iconId: string;
  iconSize: number;
}
