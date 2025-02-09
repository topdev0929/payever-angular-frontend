import { PebMigration } from '../migrations.interface';


export const borderColorToRGBA: PebMigration = async (elm: any) => {
  const text = elm.data?.text;

  if (text) {
    for (let key of ['desktop', 'mobile', 'tablet']) {
      const styles = elm.styles[key];
      if (styles) {
        const borderColor = styles.borderColor;

        if (borderColor && borderColor !== 'inherit' && typeof borderColor === 'string') {
          styles.borderColor = hexToRgba(borderColor);
        } else if (borderColor === 'inherit') {
          styles.borderColor = null;
        }
      }
    }
  }

  return elm;
};

function hexToRgba(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1,
  } : null;
}

