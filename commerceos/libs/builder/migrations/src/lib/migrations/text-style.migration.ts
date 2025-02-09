import { PebMigration } from '../migrations.interface';

export const textStyleMigration: PebMigration = async (elm: any) => {
  elm.styles && Object.values(elm.styles).forEach((style: any) => {
    !style.textStyles && (style.textStyles = getTextStyle(style, elm.data?.text?.desktop?.generic));
  });

  return elm;
};


function getTextStyle(style: any, text?: any): any {
  let attributes: any = {};

  if (text?.ops?.length && text.ops[0].attributes) {
    attributes = text.ops[0].attributes;
    delete text.ops[0].attributes;
  }

  return {
    ...attributes,
    textJustify: attributes.align,
    verticalAlign: style.verticalAlign,
  };
}
