import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ActivatedRoute, Router } from '@angular/router';
import {
AfterViewInit, Component, HostBinding, OnInit, TemplateRef, ViewChild, ViewContainerRef,
ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit {

  @HostBinding('class.app-root') appRoot = true;

  @ViewChild('settingsMenu') settingsMenu!: TemplateRef<any>;

  settingsMenuOverlayRef!: OverlayRef;
  settingsMenuItems = [
    {
      icon: '#icon-connect-block-16',
      title: 'Connect',
      onClick: () => {
        this.router.navigate(['message/connect'], { relativeTo: this.route.children[0] });
        // take id in cosf from state
        // this.router.navigateByUrl(`business/${this.envService.businessId}/message/connect`);
      },
    },
    {
      icon: '#icon-world-20',
      title: 'Integration',
      onClick: () => {
        this.router.navigate(['message/integration'], { relativeTo: this.route.children[0] });
        // take id in cosf from state
        // this.router.navigateByUrl(`business/${this.envService.businessId}/message/integration`);
      },
    },
  ];

  showBS: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  show$: Observable<boolean> = this.showBS.asObservable();

  constructor(
    private overlay: Overlay,
    private router: Router,
    private route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private pePlatformHeaderService: PePlatformHeaderService,
  ) {
  }

  ngOnInit(): void {
    const config: PePlatformHeaderConfig = {
      isShowShortHeader: false,
      showDataGridToggleItem: {
        onClick: () => {},
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'products-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: [{
        title: 'Settings',
        class: 'settings',
        onClick: () => {
          this.openOverlaySettingsMenu();
        },
      }],
    } as PePlatformHeaderConfig;

    this.pePlatformHeaderService.assignConfig(config);
  }

  ngAfterViewInit(): void {
    this.showBS.next(true);
  }

  private openOverlaySettingsMenu(): void {
    this.settingsMenuOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .left('51px')
        .top('51px'),
      hasBackdrop: true,
      backdropClass: 'pe-message-settings-menu-backdrop',
    });

    this.settingsMenuOverlayRef.backdropClick().subscribe(() => this.settingsMenuOverlayRef.dispose());
    this.settingsMenuOverlayRef.attach(new TemplatePortal(this.settingsMenu, this.viewContainerRef));
  }
}
