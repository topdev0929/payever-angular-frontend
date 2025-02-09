// tslint:disable:member-ordering
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep, isEqual } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { AbstractComponent, DashboardEventEnum, FrontendAppsEnum, PlatformService } from '../../../../common';
import { TranslateService } from '../../../../i18n/src/services/translate';
import {
  CustomControlInterface,
  LinkControlInterface,
  NavbarColor,
  NavbarControl,
  NavbarControlPosition,
  NavbarControlType,
  NavbarPosition,
  NavbarStyle,
  TextControlInterface,
} from '../../../../navbar';
import {
  CloseConfigInterface,
  HistoryBackEventInterface,
  PlatfromHeaderControlInterface,
  PlatfromHeaderInterface,
  PlatfromHeaderLinkControlInterface
} from '../../interfaces';
import { PlatformHeaderLoaderService, PlatformHeaderService } from '../../services';

const HEADER_CLASS: string = 'mat-toolbar-micro mat-toolbar-global-header transparent-mobile';
const SUBHEADER_CLASS: string = 'mat-toolbar-micro mat-toolbar-global-header mat-toolbar-micro-subheader';

@Component({
  selector: 'pe-platform-header',
  templateUrl: './platform-header.component.html',
  styleUrls: ['platform-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformHeaderComponent extends AbstractComponent implements OnInit {

  @Input() classes: string;
  @Input() color: NavbarColor = NavbarColor.DuskyLight;
  @Input() position: NavbarPosition = NavbarPosition.FixedTop;
  @Input() notificationControls: NavbarControl[];
  @Input() set showAlert(show: boolean) {
    this.showAlertValue = show;
    this.withNotification = show;
  }
  get showAlert(): boolean {
    return this.showAlertValue;
  }
  @Input() style: NavbarStyle = NavbarStyle.Transparent;

  @ViewChild('profileMenu', { static: true }) profileMenu: TemplateRef<any>;

  @HostBinding('class.pe-platform-header') hostClass: boolean = true;
  @HostBinding('class.with-notification') withNotification: boolean = false;

  disableButtons$: Observable<boolean> = this.platformHeaderService.disableButtons$;
  isSubheaderVisible$: Observable<boolean> = this.platformHeaderService.isSubheaderVisible$.pipe(takeUntil(this.destroyed$));

  subheaderControls$: Observable<NavbarControl[]> = this.platformHeaderService.subheaderControls$;
  visible$: Observable<boolean> = this.platformHeaderService.visible$;

  controls: NavbarControl[];
  notificationAlertClasses: string = `${HEADER_CLASS} mat-toolbar-notification-alert`;
  subheaderClasses: string;
  isEmptyHeader: boolean = false;

  private transparentMode: boolean = false;
  private showAlertValue: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private platformHeaderService: PlatformHeaderService,
    private platformHeaderLoaderService: PlatformHeaderLoaderService,
    private platformService: PlatformService,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.platformHeaderService.platformHeader$.pipe(takeUntil(this.destroyed$))
      .subscribe((header: PlatfromHeaderInterface) => {
        if (header) {
          // TODO add comment, what the hell is happening here?
          const headerClone: PlatfromHeaderInterface = cloneDeep(header);
          if (headerClone && headerClone.closeConfig && headerClone.closeConfig.callbackId) {
            headerClone.closeConfig.callbackId = ''; // this need to do for comparison using isEqual
          }

          if (headerClone && headerClone.saveConfig && headerClone.saveConfig.callbackId) {
            headerClone.saveConfig.callbackId = ''; // this need to do for comparison using isEqual
          }

          let index: number = -1;

          for (let i: number = this.platformHeaderService.history.length - 1; i >= 0; i--) {
            if (this.platformHeaderService.history[i].microCode !== header.microCode) {
              break;
            }
            const platformHeaderClone: PlatfromHeaderInterface = cloneDeep(this.platformHeaderService.history[i]);
            if (platformHeaderClone && platformHeaderClone.closeConfig && platformHeaderClone.closeConfig.callbackId) {
              platformHeaderClone.closeConfig.callbackId = '';
            }

            if (platformHeaderClone && platformHeaderClone.saveConfig && platformHeaderClone.saveConfig.callbackId) {
              platformHeaderClone.saveConfig.callbackId = '';
            }

            if (isEqual(headerClone, platformHeaderClone)) {
              index = i;
              break;
            }
          }

          if (index >= 0 && index < this.platformHeaderService.history.length) {
            this.platformHeaderService.history.splice(index);
          }
          this.platformHeaderService.history.push(header);
        }
      });

    this.platformHeaderService.historyBack$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: HistoryBackEventInterface) => {
        if (this.platformHeaderService.history.length > 1) {
          this.platformHeaderService.history.pop();
          const history: PlatfromHeaderInterface[] = this.platformHeaderService.history;
          const previousHeader: PlatfromHeaderInterface = history[history.length - 1];
          previousHeader.controls = this.changeInitiallySelected(previousHeader.controls);
          this.platformHeaderService.setPlatformHeader(previousHeader);
        } else if (data && data.appName) {
          this.platformHeaderLoaderService.loadAppHeaderScript(
            data.rootComponentTag,
            data.business,
            data.appName,
            data.headerInputData
          ).subscribe();
        }
      });

    // NOTE: platformHeaderSubject$ used here cos it is BehaviorSubject and can return last value.
    // It is needed because subscription can be created here after value was dispatched
    combineLatest([
      this.platformHeaderService.headerControls$,
      this.platformHeaderService.platformHeaderSubject$,
      this.platformHeaderService.headerInfoControlsSubject$,
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([headerControls, platformHeader, infoHeaderControls]) => {
        if (platformHeader && headerControls) {
          this.isEmptyHeader = !platformHeader.appDetails && platformHeader.hideProfileMenu;
          const controls: NavbarControl[] = [...infoHeaderControls] || [];
          const closeConfig: CloseConfigInterface = platformHeader.closeConfig || {} as CloseConfigInterface;
          if (platformHeader.appDetails) {
            controls.push({
              position: NavbarControlPosition.Left,
              type: NavbarControlType.Link,
              text: platformHeader.appDetails.text,
              supText: platformHeader.appDetails.supText,
              iconPrepend: platformHeader.appDetails.icon,
              iconPrependSize: 18,
              classes: 'mat-toolbar-micro-app-title',
              routerLink: closeConfig.routerLink,
              queryParams: closeConfig.queryParams,
              onClick: closeConfig.callbackId ?
                this.platformHeaderService.getOnClickCallback(closeConfig.callbackId) :
                () => this.onShowAppSelector()
            } as TextControlInterface);
          }
          let closeButton: LinkControlInterface = null;
          if (platformHeader.closeConfig && platformHeader.closeConfig.showClose) {
            const { text, tooltipText, asBackButton } = platformHeader.closeConfig;
            const closeText = text ? text : asBackButton ? 'ng_kit.toolbar.back' : 'ng_kit.toolbar.close';
            const closeTooltipText = tooltipText ? tooltipText : asBackButton ? 'ng_kit.tooltips.toolbar.back' :
              'ng_kit.tooltips.toolbar.close';
            closeButton = {
              position: NavbarControlPosition.Right,
              type: NavbarControlType.Link,
              iconPrepend: 'icon-x-24',
              iconPrependSize: 14,
              text: platformHeader.closeConfig.asBackButton ? this.translateService.translate('ng_kit.toolbar.back') : this.translateService.translate('ng_kit.toolbar.close'),
              classes: 'mat-button-fit-content close-button',
              routerLink: platformHeader.closeConfig.routerLink,
              queryParams: platformHeader.closeConfig.queryParams,
              tooltipText: platformHeader.closeConfig.asBackButton ? this.translateService.translate('ng_kit.tooltips.toolbar.back') : this.translateService.translate('ng_kit.tooltips.toolbar.close'),
              tooltipClass: 'mat-tooltip-transparent-dark-xs',
              shortcutKey: 'Escape',
              onClick: platformHeader.closeConfig.callbackId ?
                this.platformHeaderService.getOnClickCallback(platformHeader.closeConfig.callbackId) :
                () => this.onBackToDashboardClick()
            } as LinkControlInterface;
          }
          let saveButton: LinkControlInterface = null;
          if (platformHeader.saveConfig && platformHeader.saveConfig.showSave) {
            const { text, tooltipText } = platformHeader.saveConfig;
            const saveText = text ? text : 'ng_kit.toolbar.save';
            const closeTooltipText = tooltipText ? tooltipText : 'ng_kit.tooltips.toolbar.save';
            saveButton = {
              position: NavbarControlPosition.Right,
              type: NavbarControlType.Link,
              iconPrepend: 'icon-x-24',
              iconPrependSize: 14,
              text: this.translateService.translate(saveText),
              classes: 'mat-button-fit-content save-button',
              routerLink: platformHeader.saveConfig.routerLink,
              queryParams: platformHeader.saveConfig.queryParams,
              tooltipText: this.translateService.translate(closeTooltipText),
              tooltipClass: 'mat-tooltip-transparent-dark-xs',
              onClick: this.platformHeaderService.getOnClickCallback(platformHeader.saveConfig.callbackId)
            } as LinkControlInterface;
          }

          if (saveButton && platformHeader.saveConfig.beforeButtons) {
            controls.push(saveButton);
          }

          if (closeButton && platformHeader.closeConfig.beforeButtons) {
            controls.push(closeButton);
          }

          controls.push(...headerControls);
          if (!platformHeader.hideProfileMenu) {
            controls.push({
              position: NavbarControlPosition.Right,
              type: NavbarControlType.Custom,
              content: this.profileMenu
            } as CustomControlInterface);
          }

          if (saveButton && !platformHeader.saveConfig.beforeButtons) {
            controls.push(saveButton);
          }

          if (closeButton && !platformHeader.closeConfig.beforeButtons) {
            controls.push(closeButton);
          }

          this.controls = controls;
        } else {
          this.controls = null;
        }
        this.changeDetectorRef.markForCheck();
      });

    this.platformHeaderService.platformHeader$.pipe(
      takeUntil(this.destroyed$),
      withLatestFrom(this.platformHeaderService.showToolbar$)
    )
      .subscribe(([header, showToolbar]) => {
        this.transparentMode = header ? header.transparentMode : false;
        this.checkNavbarClasses(showToolbar);
      });

    this.platformHeaderService.showToolbar$.pipe(takeUntil(this.destroyed$)).subscribe((showToolbar: boolean) => {
      this.checkNavbarClasses(showToolbar);
    });

    this.platformHeaderService.headerColor$.pipe(filter(color => !!color))
      .subscribe((color: NavbarColor) => {
        this.color = color;
        this.changeDetectorRef.markForCheck();
      });

    this.platformHeaderService.headerStyle$.pipe(filter(style => !!style))
      .subscribe((style: NavbarStyle) => {
        this.style = style;
        this.changeDetectorRef.markForCheck();
      });
  }

  private onBackToDashboardClick(action?: string): void {
    this.platformService.dispatchEvent({
      target: DashboardEventEnum.DashboardBack,
      action: action || ''
    });
  }

  private onShowAppSelector(): void {
    this.platformService.dispatchEvent({
      target: DashboardEventEnum.ShowAppSelector,
      action: ''
    });
  }

  private checkNavbarClasses(showToolbar: boolean): void {
    if (this.transparentMode) {
      this.classes = showToolbar ? `${HEADER_CLASS} dark` : `${HEADER_CLASS} transparent`;
      this.subheaderClasses = showToolbar ? `${SUBHEADER_CLASS} dark` : SUBHEADER_CLASS;
    } else {
      this.classes = HEADER_CLASS;
      this.subheaderClasses = SUBHEADER_CLASS;
    }
    if (this.isEmptyHeader) {
      this.classes += ' mat-toolbar-micro-empty';
    }
    this.changeDetectorRef.markForCheck();
  }

  private changeInitiallySelected(controls: PlatfromHeaderControlInterface[]): PlatfromHeaderControlInterface[] {
    const lastClickedCallbackId: string = this.platformHeaderService
      .clickedCallbacksHistory[this.platformHeaderService.clickedCallbacksHistory.length - 1];

    return controls.map((control: PlatfromHeaderLinkControlInterface) => {
      if (control && control.initiallySelected) {
        control.initiallySelected = false;
      }

      if (control.callbackId === lastClickedCallbackId) {
        control.initiallySelected = true;
      }
      return control;
    });
  }
}
