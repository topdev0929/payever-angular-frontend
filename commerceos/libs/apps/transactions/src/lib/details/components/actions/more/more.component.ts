import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { PE_OVERLAY_DATA, PE_OVERLAY_CONFIG, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ActionTypeUIEnum } from '../../../../shared/enums/action-type.enum';

@Component({
  selector: 'pe-more-actions',
  template: `
    <div class="more-actions">
      <peb-form-background>
        <pe-actions-container
          [uiActions]="uiActions"
          (selected)="onSelected($event)"
          (closed)="onClosed()"
        ></pe-actions-container>
      </peb-form-background>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MoreActionsComponent {

  ActionTypeUIEnum: typeof ActionTypeUIEnum = ActionTypeUIEnum;

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
  ) {
    this.config.backBtnCallback = () => this.overlay.close();
    this.config.doneBtnCallback = () => this.overlay.close();
  }

  get uiActions() {
    return this.appData.uiActions;
  }

  onSelected(actionIndex: number): void {
    this.appData.onSelected$.next(actionIndex);
    this.overlay.close();
  }

  onClosed(): void {
    this.overlay.close();
  }
}
