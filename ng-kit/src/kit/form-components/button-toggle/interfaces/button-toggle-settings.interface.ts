import { ButtonToggleAlignment } from '../enums';
import { ButtonToggleInterface } from "./button-toggle.interface";
import { ButtonToggleChangeEvent } from "./button-toggle-change-event.interface";

export interface ButtonToggleSettingsInterface {
  alignment?: ButtonToggleAlignment;
  buttons: ButtonToggleInterface[];
  multiple?: boolean;
  onValueChange?: (event: ButtonToggleChangeEvent) => void;
}
