import { Observable } from 'rxjs';
import { FormSchemeField } from '../../../form';

import { OperationButtonInterface } from './action-button.interface';
import { PeListInterface } from './pe-list.interface';

export interface InfoBoxOperationInterface extends OperationButtonInterface {
  align: 'right' | 'left';
  hasPaddings?: boolean;
  color?: string;
  // apiUrl?: string;
  classes?: string;
  small?: boolean;
}

export interface FieldsetData {
  [formControlName: string]: any;
}

export interface HtmlInterface {
  innerHtml: string;
  bodyImg: string;
  icon: string;
}

interface InfoBoxSettingsBase {
  title: string;
  // closeUrl?: string;
}

// for type==='info-box'
export interface InfoBoxSettingsContentInterface {
  accordion?: AccordionPanelInterface[];
  html?: HtmlInterface; // if exist show it. All others ignore
  fieldset?: FormSchemeField[]; // show it on the top of content container
  fieldsetData?: FieldsetData;
  data?: PeListInterface; // collection of rows
}
export interface InfoBoxSettingsInfoBoxTypeInterface extends InfoBoxSettingsBase {
  type: 'info-box';
  contentType: 'accordion' | 'none';
  operations?: InfoBoxOperationInterface[];
  content: InfoBoxSettingsContentInterface;
  actionContext: any;
  triggerDownloadUrl: string;
  triggerPrintUrl: string;
}

export interface AccordionPanelInterface {
  operation?: InfoBoxOperationInterface;
  operations?: InfoBoxOperationInterface[];
  title?: string;
  icon?: string;
  html?: HtmlInterface; // if exist show it. All others ignore
  fieldset?: FormSchemeField[]; // show it on the top of content container
  fieldsetCaption?: InfoBoxFieldsetCaptionInterface; // small description on top of a form
  fieldsetData?: FieldsetData;
  dataOnTop?: boolean;
  data?: PeListInterface; // collection of rows
  disabled?: boolean;
  hideToggle?: boolean;
  nestedElements?: InfoBoxNestedElementsInterface;
  headerButton?: OperationButtonInterface;
}

export interface InfoBoxFieldsetCaptionInterface {
  classes?: string;
  text: string;
}

export interface InfoBoxNestedElementsInterface {
  accordion?: AccordionPanelInterface[];
}

// for type==='confirm'
export interface InfoBoxSettingsConfirmContent {
  icon?: string;
  title: string;
  text: string;
  operations: OperationButtonInterface[];
}
export interface InfoBoxSettingsConfirmTypeInterface extends InfoBoxSettingsBase {
  type: 'confirm';
  confirmContent?: InfoBoxSettingsConfirmContent;
}
export interface InfoBoxSettingsRedirectTypeInterface extends InfoBoxSettingsBase {
  type: 'redirect';
  url: string;
}

export type InfoBoxSettingsInterface = InfoBoxSettingsInfoBoxTypeInterface | InfoBoxSettingsConfirmTypeInterface | InfoBoxSettingsRedirectTypeInterface;

export interface InfoBoxSettingsInFormInterface {
  form: InfoBoxSettingsInterface;
}

export interface ThirdPartyFormServiceInterface {
  requestInitialForm(): Observable<InfoBoxSettingsInFormInterface>;
  executeAction(action: string, data: {}): Observable<InfoBoxSettingsInFormInterface>;
  getActionUrl(action: string): string;
  prepareUrl(url: string): string; // when operation.forceUrl is set and used instead action
  allowCustomActions(): boolean;
  allowDownload(): boolean;
}

export type HandlePayeverFieldsSaveCallback = (data: {[key: string]: any}) => Observable<void>;
