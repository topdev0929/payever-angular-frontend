import { Params } from '@angular/router';
import { NavbarControlPosition, TooltipInterface } from '../../../navbar';
import { PlatfromHeaderControlType } from '../types';
import { TemplateRef } from '@angular/core';

export interface PlatfromHeaderInterface {
  microCode: string;
  appDetails: AppDetailsInterface;
  controls: PlatfromHeaderControlInterface[];
  transparentMode?: boolean;
  closeConfig?: CloseConfigInterface;
  saveConfig?: SaveConfigInterface;
  disableSubheader?: boolean;
  hideProfileMenu?: boolean;
}

export interface PlatfromHeaderControlInterface {
  type: PlatfromHeaderControlType;
  title?: string;
  icon?: string;
  iconSize?: number;
  loading?: boolean; // Only for type link
  classes?: string;
  initiallySelected?: boolean;
  notSelectable?: boolean;
  position?: NavbarControlPosition;
}

export interface PlatfromHeaderLinkControlInterface extends PlatfromHeaderControlInterface, RouterConfigInterface, TooltipInterface {
  callbackId: string;
  loading: boolean;
}

export interface PlatfromHeaderMenuControlInterface extends PlatfromHeaderControlInterface {
  menuItems: PlatfromHeaderMenuItemControlInterface[];
  uniqueName?: string;
}

export interface PlatfromHeaderMenuItemControlInterface {
  title: string;
  icon?: string;
  iconSize?: number;
  callbackId: string;
}

export interface PlatfromHeaderCustomControlInterface extends PlatfromHeaderControlInterface {
  controlId: string;
}

export interface PlatfromHeaderCustomElementInterface extends PlatfromHeaderControlInterface {
  tag: string;
  options: { [key: string]: any };
  events: { [key: string]: () => void };
}

export interface AppDetailsInterface {
  text: string;
  icon: string;
  supText?: string;
}

export interface ControlCallbackInterface {
  id: string;
  onClick(): void;
}

export interface CustomControlContainerInterface {
  id: string;
  content: TemplateRef<any>;
}

export interface CloseConfigInterface extends RouterConfigInterface {
  showClose: boolean;
  callbackId?: string;
  asBackButton?: boolean;
  beforeButtons?: boolean;
  text?: string;
  tooltipText?: string;
}

export interface SaveConfigInterface extends RouterConfigInterface {
  showSave: boolean;
  callbackId?: string;
  beforeButtons?: boolean;
  text: string;
  tooltipText: string;
}

export interface RouterConfigInterface {
  queryParams?: Params;
  routerLink?: any[];
}

export interface HistoryBackEventInterface {
  appName: string;
  business: string;
}

export interface HistoryBackEventInterface {
  /**
   * Name of app that has own micro header app, like POS or SHOP
   */
  appName: string;

  /**
   * Current business id
   */
  business: string;

  /**
   * Root component tag of app that call historyBack() method. For example, checkout app should have header of Shop.
   * It should be tag of checkout's root component
   */
  rootComponentTag: string;

  /**
   * Input data for header app. Usually it is business and somethign like shop/terminal/channelSet id.
   * Check code of header app to find it
   */
  headerInputData: any;
}
