import { PebMigration } from '../migrations.interface';

export const fixNextElement: PebMigration = async (elm: any, page: any) => {
  if (elm.id === elm.next) {
    const next = page.elements.find((e: any) => e.prev === elm.id);

    elm.next = next ? next.id : null;
  }

  return elm;
};
