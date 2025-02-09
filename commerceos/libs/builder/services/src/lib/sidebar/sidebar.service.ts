import { ComponentFactoryResolver, ComponentRef, Injectable, Injector, Type } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { PebSidebarHeader, PebSidebarState } from '@pe/builder/core';
import { PebMainTab, PebSetInspectorAction } from '@pe/builder/state';

@Injectable()
export class PebSideBarService {
  insertDetail$ = new Subject<PebSidebarState>();

  private currentSidebarState?: PebSidebarState;
  private sidebarStateStack: PebSidebarState[] = [];

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector,
    private readonly store: Store,
  ) {}

  selectMainTab(mainTab: PebMainTab): void {
    this.store.dispatch(new PebSetInspectorAction({ mainTab }));
  }

  clear(): void {
    this.sidebarStateStack.forEach(state => this.clearView(state));
    this.sidebarStateStack = [];
    this.currentSidebarState = undefined;
  }

  openDetail<T>(detail: Type<T>, header?: PebSidebarHeader): ComponentRef<T> {
    if (this.currentSidebarState) {
      this.sidebarStateStack.push(this.currentSidebarState);
    }

    const componentRef = this.getComponentRef(detail);
    this.submitViewRef({
      viewRef: componentRef.hostView,
      header,
    });

    return componentRef;
  }

  private getComponentRef<T>(component: Type<T>): ComponentRef<T> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = componentFactory.create(this.injector);

    return componentRef;
  }

  back(): void {
    this.clearView(this.currentSidebarState);

    const state = this.sidebarStateStack.pop();
    if (state) {
      this.submitViewRef(state);
    } else {
      this.returnToMain();
    }
  }

  private submitViewRef(state: PebSidebarState): void {
    this.store.dispatch(
      new PebSetInspectorAction({
        isDetail: true,
      }),
    );

    this.currentSidebarState = state;
    this.insertDetail$.next(this.currentSidebarState);
  }

  private returnToMain(): void {
    this.currentSidebarState = undefined;
    this.store.dispatch(
      new PebSetInspectorAction({
        isDetail: false,
      }),
    );
  }

  private clearView(state?: PebSidebarState): void {
    state && !state.viewRef.destroyed && state.viewRef.destroy();
  }
}
