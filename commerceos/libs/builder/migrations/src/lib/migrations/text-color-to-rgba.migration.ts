import { PebMigration } from '../migrations.interface';

export const textColorToRGBA: PebMigration = async (elm: any) => {

  const text = elm.data?.text;
  if (text) {
    for (let key of ['desktop', 'mobile', 'tablet']) {
      const item = text[key];
      for (const key in item) {
        const language = item[key];
        const ops = language.ops;
        ops.forEach((op: any) => {
          if (op.attributes?.color && typeof op.attributes.color === 'string') {
            op.attributes.color = hexToRgba(op.attributes.color);
          }
        });
      }
    }
  }

  return elm;
};

const hexToRgba = (hex: string) => {
  if (!hex) {
    return null;
  }
  hex = hex.toLowerCase();
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = parseInt(hex.slice(7, 9), 16)/255;

  return isNaN(a) ? { r, g, b } : { r, g, b, a };
};
