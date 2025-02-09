import { PebMigration } from '../migrations.interface';

export const removeFunctionLink: PebMigration = async (elm: any) => {
  if (elm?.data?.functionLink) {
    // Integrations API is changed and also integrations ids as well, not anymore possible to map, so just delete

    delete elm.data.functionLink;
  }

  return elm;
};
