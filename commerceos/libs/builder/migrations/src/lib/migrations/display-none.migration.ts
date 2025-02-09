import { PebMigration } from '../migrations.interface';

export const setDisplayNoneWhenNoStyles: PebMigration = async (elm: any, page: any) => {

  if (!elm.styles) {
    elm.styles = {};
  }

  ['desktop', 'tablet', 'mobile'].forEach((screen) => {
    if (!elm.styles?.[screen]?.display) {
      elm.styles[screen] = { ...elm.styles[screen] ?? { display: 'none' } };
    }
  });

  return elm;
};
