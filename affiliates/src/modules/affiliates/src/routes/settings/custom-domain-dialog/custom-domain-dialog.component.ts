import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { PE_OVERLAY_DATA, PE_OVERLAY_CONFIG, PeOverlayWidgetService } from '@pe/overlay-widget';
import { AbstractComponentDirective } from '../../../misc/abstract.component';

@Component({
  selector: 'peb-custom-domain-dialog',
  templateUrl: './custom-domain-dialog.component.html',
  styleUrls: ['./custom-domain-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebCustomDomainSettingComponent extends AbstractComponentDirective implements OnInit {
  dialogConfig = {
  };

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    };
  }
  ngOnInit() {
  }
}
