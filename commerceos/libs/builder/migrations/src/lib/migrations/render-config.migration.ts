import { PebMigration } from '../migrations.interface';

export const renderConfigModel: PebMigration = async (elm: any) => {
  let configsArray = elm?.integration?.renderConfigs;

  if (configsArray?.length) {
    const renderConfig: any = {};
    configsArray.forEach((config: any) => {
      renderConfig[config.type] = config.params ?? {};
    });
    elm.integration.renderConfigs = renderConfig;
  }
};
