import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  createNgModule,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../../../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-user-check',
  template: '<ng-template #container></ng-template>',
  providers: [PeDestroyService],
})
export class UserCheckComponent extends AbstractSelectorComponent {

  @Output() toLogin = new EventEmitter<void>();

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/user-edit').then(({ UserEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(UserEditModule, this.injector);
      const componentType = moduleRef.instance.resolveUserCheckFormComponent();
      this.isAllReady$.subscribe(() => {
        const componentRef = this.containerRef.createComponent(componentType, {
          index: 0, 
          injector: moduleRef.injector,
        });
        const { instance } = componentRef;
        instance.toLogin.pipe(
          tap(() => this.toLogin.emit()),
          takeUntil(this.destroy$),
        ).subscribe();

        this.cdr.detectChanges();
      });
    });
  }
}
