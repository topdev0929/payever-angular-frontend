import { isPlatformServer } from '@angular/common';
import {
  Compiler,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injectable,
  Injector,
  NgModuleRef,
  PLATFORM_ID,
  StaticProvider,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { Observable, combineLatest, from, of } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { PebIntegrationSnackbarHandler } from '@pe/builder/integrations';
import { AppType } from '@pe/common';

import { PebClientApiService } from './api.service';
import { PebSsrStateService } from './ssr-state.service';

@Injectable()
export class PebClientCheckoutLoaderService {
  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: string,
    private pebClientApiService: PebClientApiService,
    private readonly ssrStateService: PebSsrStateService,
    ) { }

  load(vcr: ViewContainerRef): void {
    if (isPlatformServer(this.platformId)) {
      this.fetchAndStoreChannelData$().subscribe();

      return;
    }

    const appData = this.ssrStateService.getAppData();

    if (appData?.appType !== AppType.Shop){
      return;
    }

    const channelSetId$ = appData?.channelSetId 
      ? of(appData?.channelSetId)
      : this.pebClientApiService.getApp$().pipe(switchMap(data => of(data?.id))) ;

    combineLatest([from(import(`@pe/shared/checkout`)), channelSetId$]).pipe(
      switchMap(
        ([{
          PeSharedCheckoutModule,
          PebCheckoutEventHandler,
          PeSharedCheckoutComponent,
          PeSharedCheckoutStoreService,
          PeSharedCheckoutService,
        }, channelSetId]) => {

          const { ngModule, providers } = PeSharedCheckoutModule.withConfig({ generatePaymentCode: false });

          return this.loadModule(ngModule, providers as StaticProvider[]).pipe(
            tap((moduleRef) => {
              this.getServices([PebIntegrationSnackbarHandler], moduleRef.injector);
              moduleRef.injector.get(PebCheckoutEventHandler);

              const checkoutShareService = moduleRef.injector.get(PeSharedCheckoutService);
              checkoutShareService.cleanDeadCheckoutFlows();

              const checkoutService = moduleRef.injector.get(PeSharedCheckoutStoreService);
              checkoutService.app = { channelSet: channelSetId };

              const componentRef = this.loadComponent(vcr, PeSharedCheckoutComponent, moduleRef);
              componentRef.changeDetectorRef.detectChanges();
            }),
          );
        },
      ),
      take(1),
    ).subscribe();
  }

  fetchAndStoreChannelData$(): Observable<any> {
    const appData = this.ssrStateService.getAppData();
    if (appData?.channelSetId){
      return of(null);
    }

    return this.pebClientApiService.getApp$().pipe(
      tap((channelSet)=>{
        if (!channelSet){
          return;
        }

        this.ssrStateService.patchAppData({
          channelSetId: channelSet.id,
        });
      }),
      take(1)
    );
  }

  private loadModule<T>(module: Type<T>, providers: StaticProvider[] = []): Observable<NgModuleRef<T>> {
    const injector = Injector.create({ providers, parent: this.injector });
    const compiler = injector.get(Compiler);

    return from(compiler.compileModuleAsync(module)).pipe(
      map(factory => factory.create(injector)),
      shareReplay(),
    );
  }

  private loadComponent<T>(vcr: ViewContainerRef, component: Type<T>, moduleRef: NgModuleRef<any>): ComponentRef<T> {
    const factoryResolver = this.injector.get(ComponentFactoryResolver);

    const componentFactory = factoryResolver.resolveComponentFactory(component);
    const componentRef = vcr.createComponent(
      componentFactory,
      undefined,
      moduleRef.injector,
      undefined,
      moduleRef,
    );

    return componentRef;
  }

  private getServices(providers: Type<any>[], parent = this.injector): any[] {
    const injector = Injector.create({
      providers: providers.map(provider => ({ provide: provider, useClass: provider })),
      parent,
    });

    return providers.map(provider => injector.get(provider));
  }
}
