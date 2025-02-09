export interface ParagraphEditorActionInterface {
  icon: string;
  iconSize: number;
  isActive: boolean;
  cssClass: string;
}

export interface ParagraphEditorGroupActionInterface {
  icon: string;
  iconSize: number;
  actions: ParagraphEditorActionInterface[];
  isSelected: boolean;
  allowMultipleSelect: boolean;
}
