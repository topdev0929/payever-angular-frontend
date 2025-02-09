import { PebMigration } from '../migrations.interface';

export const mapBorderToNewModel: PebMigration = async (elm: any) => {
  for (let key in elm.styles) {
    const styles = elm.styles[key];
    if (styles) {
      const { borderColor, borderWidth, borderStyle, border } = styles;

      if (borderColor && borderColor !== 'inherit') {
        styles.border = {
          enabled: true,
          width: borderWidth,
          style: borderStyle,
          color: borderColor,
        };
        delete styles.borderWidth;
        delete styles.borderColor;
        delete styles.borderStyle;
      } else {
        styles.border = border ?? undefined;
      }
    }
  }

  return elm;
};
