export interface FilePickerSettingsInterface {
  accept?: string;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  /**
   * @deprecated
   * Use placeholder field instead
   */
  description?: string;
  onValueChange?(files: File[]): void;
}
