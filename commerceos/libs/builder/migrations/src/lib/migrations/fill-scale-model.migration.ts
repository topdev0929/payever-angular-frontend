import { PebMigration } from '../migrations.interface';

export const pebFillScaleModel: PebMigration = async (elm: any) => {

  Object.values(elm.styles).forEach((style: any) => {
    if (style.fill?.scale) {
      style.fill.scale = { value: style.fill.scale, unit: '%' };
    }
  });

  return elm;
};
