import { PebMigration } from '../migrations.interface';

export const removeLinkInteraction: PebMigration = async (elm: any, page: any) => {
  if (elm.type === 'grid' && elm.data.linkInteraction) {
    delete elm.data.linkInteraction;
  }

  return elm;
};
