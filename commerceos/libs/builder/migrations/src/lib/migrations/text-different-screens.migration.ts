import { PebMigration } from '../migrations.interface';

export const textDifferentScreens: PebMigration = async (elm: any) => {
  const defaultScreen = 'desktop';

  if (elm?.data?.text) {
    if (Object.keys(elm.data.text).length && !elm.data.text[defaultScreen]) {
      const firstKey = Object.keys(elm.data.text)[0];
      elm.data.text[defaultScreen] = elm.data.text[firstKey];
    }
  }

  return elm;
};
