import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { values } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { EventEnum, HeaderActionsEnum, HeaderTargetEnum, PlatformAbstractService, PlatformEventInterface } from '../../../common';
import {
  LinkControlInterface,
  MenuControlInterface,
  MenuItemInterface,
  NavbarColor,
  NavbarControl,
  NavbarControlPosition,
  NavbarControlType,
  NavbarStyle,
  TextControlInterface,
  CustomControlInterface,
  CustomElementInterface
} from '../../../navbar';
import { peVariables } from '../../../pe-variables';
import { WindowService } from '../../../window';
import {
  ControlCallbackInterface, HistoryBackEventInterface,
  PlatfromHeaderControlInterface,
  PlatfromHeaderInterface,
  PlatfromHeaderLinkControlInterface,
  PlatfromHeaderMenuControlInterface,
  PlatfromHeaderMenuItemControlInterface,
  CustomControlContainerInterface,
  PlatfromHeaderCustomControlInterface,
  PlatfromHeaderCustomElementInterface
} from '../interfaces';

export const HEADER_HEIGHT: number = 26;

const PLATFORM_HEADER_TAG_NAME: string = 'pe-platform-header';
const PROFILE_MENU_TAG_NAME: string = 'profile-menu';
const CLOSE_BUTTON_SELECTOR: string = 'pe-platform-header .close-button';

const INFO_CONTROLS_STORAGE_KEY: string = 'pe_info_controls';

@Injectable()
export class PlatformHeaderService extends PlatformAbstractService {

  platformHeaderSubject$: BehaviorSubject<PlatfromHeaderInterface> = new BehaviorSubject<PlatfromHeaderInterface>(null);
  headerInfoControlsSubject$: BehaviorSubject<NavbarControl[]> = new BehaviorSubject<NavbarControl[]>([]);

  clickedCallbacksHistory: string[] = [];
  history: PlatfromHeaderInterface[] = [];

  eventName = EventEnum.Header;
  private sidebarButtonClickSubj$: Subject<boolean> = new Subject<boolean>();

  private callbackIdSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private disableButtonsSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private headerControlsSubject$: BehaviorSubject<NavbarControl[]> = new BehaviorSubject<NavbarControl[]>(null);
  private headerColorSubject$: BehaviorSubject<NavbarColor> = new BehaviorSubject<NavbarColor>(null);
  private headerStyleSubject$: BehaviorSubject<NavbarStyle> = new BehaviorSubject<NavbarStyle>(null);
  private showToolbarSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private subheaderControlsSubject$: BehaviorSubject<NavbarControl[]> = new BehaviorSubject<NavbarControl[]>(null);
  private visibleSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private controlCallbacks: ControlCallbackInterface[] = [];

  private componentCallbacks: { [key: string]: { [key: string]: any } } = {};

  constructor(private windowService: WindowService) {
    super();

    this.platformHeader$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((header: PlatfromHeaderInterface) => {
      this.platformHeaderSubject$.next(header);
      this.callbackIdSubject$.next(null);
      this.setHeaderControls(header);
    });

    this.controlClick$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((callback: ControlCallbackInterface) => {
      const control: PlatfromHeaderLinkControlInterface = callback ? this.getControlByCallbackId(callback.id) : null;
      const ignoreClick: boolean = !callback || !callback.onClick || (this.callbackIdSubject$.value && this.callbackIdSubject$.value === callback.id) ||
        (control && control.initiallySelected && !this.callbackIdSubject$.value);
      if (!ignoreClick) {
        this.clickedCallbacksHistory.push(callback.id);
        callback.onClick();
      }
    });

    this.calledCallbackId$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((callbackId: string) => {
      const isCloseButtonPressed: boolean = this.platformHeaderSubject$.value &&
        this.platformHeaderSubject$.value.closeConfig &&
        callbackId === this.platformHeaderSubject$.value.closeConfig.callbackId;

      const isSaveButtonPressed: boolean = this.platformHeaderSubject$.value &&
        this.platformHeaderSubject$.value.saveConfig &&
        callbackId === this.platformHeaderSubject$.value.saveConfig.callbackId;

      const control: PlatfromHeaderLinkControlInterface = this.getControlByCallbackId(callbackId);
      if (!isCloseButtonPressed && control && !control.notSelectable) {
        this.callbackIdSubject$.next(callbackId);
      }
      if (!isCloseButtonPressed) {
        this.clickedCallbacksHistory.push(callbackId);
      }

      if (!isSaveButtonPressed && control && !control.notSelectable) {
        this.callbackIdSubject$.next(callbackId);
      }
      if (!isSaveButtonPressed) {
        this.clickedCallbacksHistory.push(callbackId);
      }
    });
  }

  get disableButtons$(): Observable<boolean> {
    return this.disableButtonsSubject$.asObservable();
  }

  set disableButtons(value: boolean) {
    this.disableButtonsSubject$.next(value);
  }

  get mobileView$(): Observable<boolean> {
    return this.windowService.width$.pipe(takeUntil(this.ngUnsubscribe), map((width: number) => {
      return width < peVariables.toNumber('viewportBreakpointIpad') + peVariables.toNumber('gridUnitX') * 4;
    }));
  }

  get platformHeader$(): Observable<PlatfromHeaderInterface> {
    return this.observe$.pipe(
      filter((event: PlatformEventInterface) => event.target === HeaderTargetEnum.Controls),
      filter((event: PlatformEventInterface) => event.action === HeaderActionsEnum.Set),
      map((event: PlatformEventInterface) => event.data)
    );
  }

  get controlClick$(): Observable<ControlCallbackInterface> {
    return this.observe$.pipe(
      filter((event: PlatformEventInterface) => event.target === HeaderTargetEnum.Controls),
      filter((event: PlatformEventInterface) => event.action === HeaderActionsEnum.Click),
      map((event: PlatformEventInterface) => this.controlCallbacks
        .find((controlCallback: ControlCallbackInterface) => controlCallback.id === event.data))
    );
  }

  get calledCallbackId$(): Observable<string> {
    return this.observe$.pipe(
      filter((event: PlatformEventInterface) => event.target === HeaderTargetEnum.Controls),
      filter((event: PlatformEventInterface) => event.action === HeaderActionsEnum.Click),
      map((event: PlatformEventInterface) => event.data)
    );
  }

  get headerControls$(): Observable<NavbarControl[]> {
    return this.headerControlsSubject$.asObservable();
  }

  get headerColor$(): Observable<NavbarColor> {
    return this.headerColorSubject$.asObservable();
  }

  get headerStyle$(): Observable<NavbarStyle> {
    return this.headerStyleSubject$.asObservable();
  }

  get isSubheaderVisible$(): Observable<boolean> {
    return combineLatest([
      this.mobileView$,
      this.subheaderControls$
    ]).pipe(
      map((data: [boolean, NavbarControl[]]) => {
        return data[0] && data[1] && data[1].length > 0;
      })
    );
  }

  get headerHeight$(): Observable<number> {
    return combineLatest([
      this.headerControlsSubject$,
      this.platformHeaderSubject$,
      this.isSubheaderVisible$
    ]).pipe(map(data => {
      const isHeaderVisible = !!data[0] && !!data[1];
      const isSubheaderVisible = !!data[2];
      return (isHeaderVisible ? HEADER_HEIGHT : 0) + (isSubheaderVisible ? HEADER_HEIGHT : 0);
    }));
  }

  // Use DOM instead of service variables, cos each app on page has own instance on service
  // But header element should be only one
  get isHeaderHasData(): boolean {
    const elements = document.getElementsByTagName(PLATFORM_HEADER_TAG_NAME);
    let hasData: boolean = false;
    if (elements && elements.length) {
      hasData = elements[0].children.length > 0;
    }
    return hasData;
  }

  get isProfileMenu(): boolean {
    return !!document.querySelector(PROFILE_MENU_TAG_NAME);
  }

  get isCloseButton(): boolean {
    return !!document.querySelector(CLOSE_BUTTON_SELECTOR);
  }

  get historyBack$(): Observable<HistoryBackEventInterface> {
    return this.observe$.pipe(
      filter((event: PlatformEventInterface) => event.target === HeaderTargetEnum.Controls),
      filter((event: PlatformEventInterface) => event.action === HeaderActionsEnum.HistoryBack),
      map((event: PlatformEventInterface) => event.data)
    );
  }

  get subheaderControls$(): Observable<NavbarControl[]> {
    return this.subheaderControlsSubject$.asObservable();
  }

  get sidebarButtonClick$(): Observable<boolean> {
    return this.sidebarButtonClickSubj$.asObservable();
  }

  get showToolbar$(): Observable<boolean> {
    return this.showToolbarSubject$.asObservable();
  }

  set showToolbar(value: boolean) {
    this.showToolbarSubject$.next(value);
  }

  get visible$(): Observable<boolean> {
    return this.visibleSubject$.asObservable();
  }

  set visible(value: boolean) {
    this.visibleSubject$.next(value);
  }

  historyBack(data?: HistoryBackEventInterface): void {
    this.dispatchEvent({
      target: HeaderTargetEnum.Controls,
      action: HeaderActionsEnum.HistoryBack,
      data
    });
  }

  setPlatformHeader(platformHeader: PlatfromHeaderInterface): void {
    this.dispatchEvent({
      target: HeaderTargetEnum.Controls,
      action: HeaderActionsEnum.Set,
      data: platformHeader
    });
  }

  setHeaderColor(color: NavbarColor): void {
    this.headerColorSubject$.next(color);
  }

  setHeaderStyle(style: NavbarStyle): void {
    this.headerStyleSubject$.next(style);
  }

  sidebarButtonClick(): void {
    this.sidebarButtonClickSubj$.next(true);
  }

  getCustomControlStorage(): CustomControlContainerInterface[] {
    const storageKey: string = 'pe_customControlContainers';
    const customControlContainers: CustomControlContainerInterface[]
      = window[storageKey] || (window[storageKey] = []);

    return customControlContainers;
  }

  registerCustomControl(controlTemplate: TemplateRef<any>): string {
    const controlContainer: CustomControlContainerInterface = {
      id: uuid(),
      content: controlTemplate
    };

    const storage: CustomControlContainerInterface[] = this.getCustomControlStorage();
    storage.push(controlContainer);
    return controlContainer.id;
  }

  unregisterCustomControl(controlId: string): void {
    const storage: CustomControlContainerInterface[] = this.getCustomControlStorage();
    const index: number = storage.findIndex(c => c.id === controlId);
    if (index !== -1) {
      storage.splice(index, 1);
    }
    const header: PlatfromHeaderInterface = this.platformHeaderSubject$.getValue();
    if (header && header.controls && header.controls.length) {
      header.controls = header.controls.filter((c: any) => c.controlId !== controlId);
    }
    this.setHeaderControls(header);
  }

  getCustomControl(controlId: string): TemplateRef<any> {
    const storage: CustomControlContainerInterface[] = this.getCustomControlStorage();
    const controlContainer: CustomControlContainerInterface
      = storage.find(container => container.id === controlId);
    return controlContainer ? controlContainer.content : null;
  }

  registerCallback(callback: () => void, componentName?: string): string {
    const controlCallback: ControlCallbackInterface = {
      id: uuid(),
      onClick: callback
    };
    this.controlCallbacks.push(controlCallback);
    if (componentName) {
      const compCallbacks: {} = this.componentCallbacks[componentName] || (this.componentCallbacks[componentName] = {});
      compCallbacks[controlCallback.id] = true;
    }
    return controlCallback.id;
  }

  unregisterCallback(callbackId: string): void {
    const callIndex: number = this.controlCallbacks.findIndex(c => c.id === callbackId);
    if (callIndex !== -1) {
      this.controlCallbacks.splice(callIndex, 1);
    }
  }

  unregisterComponentCallback(componentName: string): void {
    const ids: { [key: string]: any } = this.componentCallbacks[componentName] || {};
    for (const id in ids) {
      if (ids.hasOwnProperty(id)) {
        this.unregisterCallback(id);
      }
    }
    delete this.componentCallbacks[componentName];
  }

  getOnClickCallback(callbackId: string): () => void {
    return () => {
      if (callbackId) {
        this.dispatchEvent({
          target: HeaderTargetEnum.Controls,
          action: HeaderActionsEnum.Click,
          data: callbackId
        });
      }
    };
  }

  /**
   * TODO
   * Move it to notification center
   */
  addInfoControl(control: PlatfromHeaderControlInterface): string {
    const storage = this.getInfoControlStorage();
    const id = uuid();

    storage[id] = {
      ...control,
      position: NavbarControlPosition.Right
    };
    const header: PlatfromHeaderInterface = this.platformHeaderSubject$.getValue();
    this.setPlatformHeader(header);

    return id;
  }

  /**
   * TODO
   * Move it to notification center
   */
  updateInfoControl(id: string, control: PlatfromHeaderControlInterface) {
    const storage = this.getInfoControlStorage();

    if (storage[id]) {
      storage[id] = {
        ...storage[id],
        ...control
      };
      const header: PlatfromHeaderInterface = this.platformHeaderSubject$.getValue();
      this.setPlatformHeader(header);
    }
  }

  /**
   * TODO
   * Move it to notification center
   */
  removeInfoControl(controlId: string) {
    const storage = this.getInfoControlStorage();
    delete storage[controlId];

    const header: PlatfromHeaderInterface = this.platformHeaderSubject$.getValue();
    this.setPlatformHeader(header);
  }

  private setHeaderControls(header: PlatfromHeaderInterface): void {
    if (header) {
      const infoControlsStorage = this.getInfoControlStorage();
      const infoComponents = values(infoControlsStorage);

      this.headerInfoControlsSubject$.next(infoComponents.map((control: PlatfromHeaderControlInterface) => {
        return this.getNavbarControl(control, !header.disableSubheader);
      }));

      this.headerControlsSubject$.next(header.controls.map((control: PlatfromHeaderControlInterface) => {
        return this.getNavbarControl(control, !header.disableSubheader);
      }));
      if (!header.disableSubheader) {
        this.subheaderControlsSubject$.next(header.controls.map((control: PlatfromHeaderControlInterface) => {
          return this.getNavbarControl(control, false);
        }));
      } else {
        this.subheaderControlsSubject$.next(null);
      }
    } else {
      this.headerControlsSubject$.next(null);
      this.subheaderControlsSubject$.next(null);
    }
  }

  private getNavbarControl(control: PlatfromHeaderControlInterface, hiddenForMobile: boolean): NavbarControl {
    switch (control.type) {
      case NavbarControlType.Link: {
        return combineLatest([this.callbackIdSubject$, this.mobileView$])
          .pipe(
            takeUntil(this.ngUnsubscribe),
            map((data: [string, boolean]) => {
              const linkControl: PlatfromHeaderLinkControlInterface = control as PlatfromHeaderLinkControlInterface;
              const isControlSelected: boolean = this.isControlSelected(linkControl, data[0]);
              return {
                position: control.position ? control.position : NavbarControlPosition.Left,
                type: NavbarControlType.Link,
                text: control.title,
                iconPrepend: control.icon,
                loading: control.loading,
                iconPrependSize: control.iconSize ? control.iconSize : 16,
                hidden: hiddenForMobile && data[1],
                classes: `${control.classes} ${isControlSelected && !control.notSelectable ? 'selected' : ''}`,
                onClick: this.getOnClickCallback(linkControl.callbackId),
                queryParams: linkControl.queryParams,
                routerLink: linkControl.routerLink,
                tooltipText: linkControl.tooltipText,
                tooltipClass: linkControl.tooltipClass || 'mat-tooltip-transparent-dark-xs'
              } as LinkControlInterface;
            })
          );
      }
      case NavbarControlType.Menu: {
        return this.mobileView$
          .pipe(
            takeUntil(this.ngUnsubscribe),
            map((mobileView: boolean) => {
              return {
                position: control.position ? control.position : NavbarControlPosition.Left,
                type: NavbarControlType.Menu,
                text: control.title,
                buttonClasses: control.initiallySelected && !control.notSelectable ? 'selected' : '',
                classes: `${control.classes}`,
                iconPrepend: control.icon,
                iconPrependSize: control.iconSize ? control.iconSize : 16,
                hidden: hiddenForMobile && mobileView,
                menuItems: (control as PlatfromHeaderMenuControlInterface).menuItems.map((item: PlatfromHeaderMenuItemControlInterface) => {
                  return {
                    text: item.title,
                    iconPrepend: item.icon,
                    iconPrependSize: item.iconSize ? item.iconSize : 16,
                    onClick: this.getOnClickCallback(item.callbackId)
                  } as MenuItemInterface;
                }),
                uniqueName: (control as PlatfromHeaderMenuControlInterface).uniqueName,
              } as MenuControlInterface;
            })
          );
      }
      case NavbarControlType.Text: {
        return this.mobileView$
          .pipe(
            takeUntil(this.ngUnsubscribe),
            map((mobileView: boolean) => {
              return {
                position: control.position ? control.position : NavbarControlPosition.Left,
                type: NavbarControlType.Text,
                text: control.title,
                classes: control.classes,
                iconPrepend: control.icon,
                iconPrependSize: control.iconSize ? control.iconSize : 16,
                hidden: hiddenForMobile && mobileView,
              } as TextControlInterface;
            })
          );
      }
      case NavbarControlType.Custom: {
        return this.mobileView$
          .pipe(
            takeUntil(this.ngUnsubscribe),
            map((mobileView: boolean) => {
              const customControl: PlatfromHeaderCustomControlInterface =
                control as PlatfromHeaderCustomControlInterface;
              return {
                position: control.position ? control.position : NavbarControlPosition.Left,
                type: NavbarControlType.Custom,
                classes: control.classes,
                hidden: hiddenForMobile && mobileView,
                content: this.getCustomControl(customControl.controlId)
              } as CustomControlInterface;
            })
          );
      }
      case NavbarControlType.CustomElement: {
        return this.mobileView$
          .pipe(
            takeUntil(this.ngUnsubscribe),
            map((mobileView: boolean) => {
              const customElement: PlatfromHeaderCustomElementInterface =
                control as PlatfromHeaderCustomElementInterface;
              return {
                position: control.position ? control.position : NavbarControlPosition.Left,
                type: NavbarControlType.CustomElement,
                classes: control.classes,
                hidden: hiddenForMobile && mobileView,
                tag: customElement.tag,
                options: customElement.options,
                events: customElement.events
              } as CustomElementInterface;
            })
          );
      }
      default: {
        return of(null);
      }
    }
  }

  private getInfoControlStorage(): { [key: string]: PlatfromHeaderControlInterface } {
    const customControlContainers: { [key: string]: PlatfromHeaderControlInterface }
      = window[INFO_CONTROLS_STORAGE_KEY] || (window[INFO_CONTROLS_STORAGE_KEY] = {});

    return customControlContainers;
  }

  private isControlSelected(control: PlatfromHeaderLinkControlInterface, callbackId: string): boolean {
    if (callbackId) {
      return control.callbackId === callbackId;
    } else {
      return control.initiallySelected;
    }
  }

  private getControlByCallbackId(callbackId: string): PlatfromHeaderLinkControlInterface {
    return this.platformHeaderSubject$.value && this.platformHeaderSubject$.value.controls ?
      this.platformHeaderSubject$.value.controls.find((item: PlatfromHeaderControlInterface) => item['callbackId'] && item['callbackId'] === callbackId) as PlatfromHeaderLinkControlInterface :
      null;
  }
}
