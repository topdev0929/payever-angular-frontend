export interface SelectOptionInterface {
  label: string;
  value: any;
  iconRef?: string;
  imgRef?: string;
  groupId?: string;
  hexColor?: string;
}

export interface SelectOptionGroupInterface {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroupFormattedInterface {
  label: string;
  disabled: boolean;
  items: SelectOptionInterface[];
}
