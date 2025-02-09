import { PebMigration } from '../migrations.interface';

export const pebPositionModel: PebMigration = async (elm: any) => {

  const def = elm.styles.desktop;

  Object.entries(elm.styles).forEach(([key, style]: any) => {

    if (typeof style.position !== 'object' && (style.top !== undefined || key === 'desktop')) {
      style.position = {
        type: style.position && typeof style.position === 'string' ? style.position : 'default',
        top: { value: style.top ?? def.top, unit: 'px' },
        left: { value: style.left ?? def.left, unit: 'px' },
      };

      delete style.left;
      delete style.top;
    }

    if (style.width !== undefined || style.height !== undefined) {
      style.dimension = {
        width: { value: style.width ?? def.width, unit: 'px' },
        height: { value: style.height ?? def.height, unit: 'px' },
      };

      delete style.width;
      delete style.height;
    }

    if (elm.type === 'grid') {
      style.layout = {
        type: 'grid',
        rows: style.gridTemplateRows,
        columns: style.gridTemplateColumns,
      };
    }
  });

  return elm;
};
