import { Component, ChangeDetectionStrategy, Injector, OnInit, createNgModule } from '@angular/core';

import { SnackBarService, SnackBarConfig } from '@pe/checkout/ui/snackbar';
import { WindowEventsService } from '@pe/checkout/window';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'payment-micro-snack-bar-shower',
  template: '',
  providers: [PeDestroyService],
})
export class SnackBarShowerComponent implements OnInit {

  private windowEventsService = this.injector.get(WindowEventsService);
  private destroy$ = this.injector.get(PeDestroyService);

  private snackbarService: SnackBarService;

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.windowEventsService.message$(this.destroy$).subscribe((event: MessageEvent) => {
      if (event?.data?.value && event.data.event === 'payeverCheckoutSnackBarToggle') {
        const value = event.data.value; // TODO Interface
        this.toggle(value.isShow, value.message, value.config);
      }
    });
  }

  private toggle(isShow: boolean, message: string, config: SnackBarConfig): void {
    if (!this.snackbarService) {
      this.loadSnackbarModule().then(() => this.toggle(isShow, message, config));
    } else {
      this.snackbarService.toggle(
        isShow === undefined ? true : !!isShow,
        message,
        config || {}
      );
    }
  }

  // We lazy-load snackbar because it pulls ~20kbs in main otherwise
  private loadSnackbarModule(): Promise<void> {
    return import('@pe/checkout/ui/snackbar')
      .then(({ SnackBarModule, SnackBarService }) => {
        const moduleRef = createNgModule(SnackBarModule, this.injector);
        this.snackbarService = moduleRef.injector.get(SnackBarService);
      });
  }
}
