import { InputChangeEvent } from '../../../form-core/interfaces';

export interface InputPasswordSettingsInterface {
  placeholder?: string;
  showPasswordRequirements?: boolean;
  showForgotPassword?: boolean;
  onValueChange?(event: InputChangeEvent): void;
  forgotPasswordClick?(event: MouseEvent): void;
  onBlur?(event: FocusEvent): void;
}
