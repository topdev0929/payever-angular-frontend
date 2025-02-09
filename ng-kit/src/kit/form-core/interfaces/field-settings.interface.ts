export type labelClickedCallback = (event: MouseEvent) => void;

export interface FieldSettingsInterface {
  classList?: string;
  label?: string;
  labelClicked?: labelClickedCallback;
  blockCopyPaste?: boolean;
  required?: boolean;
  readonly?: boolean;
  fullStoryHide?: boolean;
  tabIndex?: number;
}
