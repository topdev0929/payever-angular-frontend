import { PebMigration } from '../migrations.interface';

export const changeNameProperty: PebMigration = async (elm: any) => {
  const name = elm.data?.name;

  if (name) {
    elm.name = name;
  }

  return elm;
};
