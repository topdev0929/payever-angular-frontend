import { PebMigration } from '../migrations.interface';


export const removeUnusedElement: PebMigration = async (elm: any, page: any) => {
  if (!elm.styles) {
    const index = page.elements.findIndex((element: any) => element.id === elm.id);

    page.elements.splice(index, 1);
  }

  return elm;
};
