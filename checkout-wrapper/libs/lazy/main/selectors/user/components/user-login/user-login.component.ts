import {
  Component, ChangeDetectionStrategy, Output, EventEmitter, createNgModule,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import type { UserLoginFormComponent } from '@pe/checkout/sections/user-edit';
import { OpenNextStep } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../../../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-user-login',
  templateUrl: 'user-login.component.html',
  providers: [PeDestroyService],
})
export class UserLoginComponent extends AbstractSelectorComponent {

  @Output() toGuest: EventEmitter<boolean> = new EventEmitter<boolean>();

  private instance: UserLoginFormComponent = null;
  private subs: Subscription[] = [];

  onContinue(): void {
    this.store.dispatch(new OpenNextStep());
  }

  continueAsGuest(): void {
    this.toGuest.emit(true);
  }

  protected initFlow(): void {
    super.initFlow();
    this.initInputsOutputs();
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        this.instance.continue.pipe(takeUntil(this.destroy$)).subscribe(value => this.onContinue()),
        this.instance.toGuest.pipe(takeUntil(this.destroy$)).subscribe(value => this.continueAsGuest()),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {

    import('@pe/checkout/sections/user-edit').then(({ UserEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(UserEditModule, this.injector);
      const componentType = moduleRef.instance.resolveUserLoginFormComponent();
      this.isAllReady$.subscribe(() => {
        const instanceData = this.containerRef.createComponent(componentType, {
          index: 0,
          injector: moduleRef.injector,
        });

        this.instance = instanceData.instance;
        this.initInputsOutputs();

        this.cdr.detectChanges();
      });
    });
  }
}
