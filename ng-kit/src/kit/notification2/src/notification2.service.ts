import {Injectable, ComponentFactoryResolver, ComponentRef, ApplicationRef} from '@angular/core';
import {Notification2Component} from './notification2/notification2.component';
import {Notification2WrapperComponent} from './notification2-wrapper/notification2-wrapper.component';
import {Notification2Config, Notification2DefaultConfig} from './notification2.config';

@Injectable()
export class Notification2Service {

  private wrapperRef: ComponentRef<Notification2WrapperComponent>;

  constructor(private resolver: ComponentFactoryResolver, private applicationRef: ApplicationRef) {};

  createNotification(config: Notification2Config): ComponentRef<Notification2Component> {
    const c: Notification2Config = {};
    Object.assign(c, Notification2DefaultConfig);
    if (config) {
      Object.assign(c, config);
    }

    if (!this.wrapperRef) {
      let viewContainerRef = this.applicationRef.components[0].instance.viewContainerRef;
      if (!viewContainerRef) {
        throw new Error(`Please add 'public viewContainerRef: ViewContainerRef' to the constructor of '${this.applicationRef.components[0].instance.constructor.name}' class!`);
      }
      let wrapperFactory = this.resolver.resolveComponentFactory(Notification2WrapperComponent);
      this.wrapperRef = viewContainerRef.createComponent(wrapperFactory);
    }

    const factory = this.resolver.resolveComponentFactory(Notification2Component);
    let componentRef = this.wrapperRef.instance.placeholder.createComponent(factory, 0);
    componentRef.instance.setConfig(c);

    // componentRef.instance.close.subscribe(() => {
    //   componentRef.destroy();
    //   componentRef = null;
    // });

    return componentRef;
  }

}
