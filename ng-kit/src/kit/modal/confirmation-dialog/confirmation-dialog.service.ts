import {Injectable, ComponentFactoryResolver, ComponentRef, ViewContainerRef} from '@angular/core';
import {ConfirmationDialogComponent} from './confirmation-dialog.component';
import {ConfirmationDialogConfig, confirmationDialogDefaultConfig} from './confirmation-dialog.config';

@Injectable()
export class ConfirmationDialogService {

  constructor(private resolver: ComponentFactoryResolver) {}

  createConfirmationDialog(config: ConfirmationDialogConfig, ref?: ViewContainerRef): ComponentRef<ConfirmationDialogComponent> {
    const c: any = {};
    Object.assign(c, confirmationDialogDefaultConfig);
    if (config) {
      Object.assign(c, config);
    }

    const factory: any = this.resolver.resolveComponentFactory(ConfirmationDialogComponent);
    let cmpRef: any = ref.createComponent(factory);
    cmpRef.instance.setConfig(c);

    cmpRef.instance.hide.subscribe(() => {
      cmpRef.destroy();
      cmpRef = null;
    });
    return cmpRef;
  }

}
