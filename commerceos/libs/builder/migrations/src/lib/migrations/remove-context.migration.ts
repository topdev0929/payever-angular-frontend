import { PebMigration } from '../migrations.interface';

export const removeContext: PebMigration = async (elm: any) => {
  if (elm.context) {
    delete elm['context'];
  }

  return elm;
};
