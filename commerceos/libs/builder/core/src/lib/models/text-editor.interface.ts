
import { PebTextStyles } from './text.model';


/** If there are different values in selection range, an array with all values will be reported. */
export type PebTextSelectionStyles =  {
  [P in keyof PebTextStyles]: PebTextStyles[P] | Array<PebTextStyles[P]>
};

export enum TextEditorCommand {
  link = 'link',
  fontFamily = 'fontFamily',
  color = 'color',
  fontWeight = 'fontWeight',
  italic = 'italic',
  underline = 'underline',
  strike = 'strike',
  fontSize = 'fontSize',
  justify = 'align',
}
