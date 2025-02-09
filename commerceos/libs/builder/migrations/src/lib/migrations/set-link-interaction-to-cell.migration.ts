import { PebMigration } from '../migrations.interface';

export const setLinkInteractionToCell: PebMigration = async (elm: any, page: any) => {
  if (elm.parent?.type === 'grid') {
    const grid = page.elements.find((element: any) => element.id === elm.parent.id);

    if (grid?.data?.linkInteraction) {
      elm.data.linkInteraction = grid.data.linkInteraction;
    }
  }

  return elm;
};
