import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import { Subject } from 'rxjs';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { ActionModalButtonInterface, HeaderService } from '../../../../shared';

@Component({
  selector: 'or-action-modal',
  styleUrls: ['action-modal.component.scss'],
  templateUrl: 'action-modal.component.html'
})
export class ActionModalComponent implements OnInit, OnDestroy {

  footerRightButtons: ActionModalButtonInterface[];
  footerLeftButtons: ActionModalButtonInterface[];
  isLoading: boolean;

  @Input() heading: string;
  @Input() close$: Subject<void>;

  @Input()
  set buttons(buttons: ActionModalButtonInterface[]) {
    this.footerRightButtons = cloneDeep(buttons).filter((button: any) => !button.location);
    this.footerLeftButtons = cloneDeep(buttons).filter((button: any) => button.location === 'left');
    this.changeDetectorRef.detectChanges();
  }

  @Input()
  set loading(isLoading: boolean) {
    this.isLoading = isLoading;
    this.changeDetectorRef.detectChanges();
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private headerService: HeaderService,
    private platformHeaderService: PlatformHeaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.close$.subscribe(() => this.onClose());
    this.headerService.setShortHeader(this.heading, () => this.onClose());
  }

  ngOnDestroy(): void {
    this.headerService.destroyShortHeader();
  }

  get isSingleButton(): boolean {
    return (this.footerRightButtons.length + this.footerLeftButtons.length) === 1;
  }

  get singleButton(): ActionModalButtonInterface {
    return this.footerRightButtons && this.footerRightButtons[0] ? this.footerRightButtons[0] : this.footerLeftButtons[0];
  }

  onClose(): void {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

}
