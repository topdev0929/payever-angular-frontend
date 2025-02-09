import {Injectable, ComponentFactoryResolver, ComponentRef, ApplicationRef, ComponentFactory, ViewContainerRef} from '@angular/core';
import {NotificationComponent} from './notification/notification.component';
import {NotificationWrapperComponent} from './notification-wrapper/notification-wrapper.component';
import {NotificationConfig, NotificationDefaultConfig, NotificationItemConfig, NotificationItemDefaultConfig} from './notification.config';
import {NotificationItemComponent} from './notification-item/notification-item.component';

@Injectable()
export class NotificationService {
  private wrapperRef: { [position: string]: ComponentRef<NotificationWrapperComponent>; } = {};

  constructor(private resolver: ComponentFactoryResolver, private applicationRef: ApplicationRef) {}

  createNotification(config: NotificationConfig): ComponentRef<NotificationComponent> {
    const notifConfig: NotificationConfig = {};
    Object.assign(notifConfig, NotificationDefaultConfig);
    if (config) {
      Object.assign(notifConfig, config);
    }
    this.setupNotificationWrapper(notifConfig);

    const factory: ComponentFactory<NotificationComponent> = this.resolver.resolveComponentFactory(NotificationComponent);
    let componentRef: ComponentRef<NotificationComponent> = this.wrapperRef[notifConfig.position].instance.placeholder.createComponent(factory, 0);
    componentRef.instance.setConfig(notifConfig);

    componentRef.instance.close.subscribe(() => {
      componentRef.destroy();
      componentRef = null;
    });

    return componentRef;
  }

  setupNotificationWrapper(config: NotificationItemConfig | NotificationConfig): void {
    if (!this.wrapperRef[config.position]) {
      const viewContainerRef: ViewContainerRef = this.applicationRef.components[0].instance.viewContainerRef;
      if (!viewContainerRef) {
        throw new Error(`Please add 'public viewContainerRef: ViewContainerRef' to the constructor of '${this.applicationRef.components[0].instance.constructor.name}' class!`);
      }
      const wrapperFactory: ComponentFactory<NotificationWrapperComponent> = this.resolver.resolveComponentFactory(NotificationWrapperComponent);
      this.wrapperRef[config.position] = viewContainerRef.createComponent(wrapperFactory);
      this.wrapperRef[config.position].instance.position = config.position;
    }
  }

  // @TODO why name conflict? createNotification vs createUiNotification?
  createUiNotification( config: NotificationItemConfig): void {
    const notifConfig: NotificationItemConfig = {};
    Object.assign(notifConfig, NotificationItemDefaultConfig);
    if (config) {
      Object.assign(notifConfig, config);
    }
    this.setupNotificationWrapper(notifConfig);

    const factory: ComponentFactory<NotificationItemComponent> = this.resolver.resolveComponentFactory (NotificationItemComponent);
    let componentRef: ComponentRef<NotificationItemComponent> = this.wrapperRef[notifConfig.position].instance.placeholder.createComponent(factory, 0);
    componentRef.instance.setConfig(notifConfig);

    componentRef.instance.close.subscribe(() => {
      componentRef.destroy();
      componentRef = null;
    });
  }
}
