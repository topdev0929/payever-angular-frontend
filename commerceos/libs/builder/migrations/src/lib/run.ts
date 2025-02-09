import { loader } from './integration.loader';
import {
  fixImageUrl,
  fixNextElement,
  mapFillData,
  removeContext,
  removeFunctionLink,
  removeLinkInteraction,
  removeMotionBasketFill,
  removeUnusedElement,
  setDisplayNoneWhenNoStyles,
  setLinkInteractionToCell,
  borderColorToRGBA,
  animationLoopIteration,
  mapBorderToNewModel,
  changeNameProperty,
  pebPositionModel,
  textStyleMigration,
  textDifferentScreens,
  pebFillScaleModel,
  triggerEnumUpdate,
  renderConfigModel,
} from './migrations';
import { PebMigration } from './migrations.interface';


export const migrations: { [index: number]: PebMigration } = {
  36: removeFunctionLink,
  38: setLinkInteractionToCell,
  39: removeLinkInteraction,
  40: removeMotionBasketFill,
  41: fixNextElement,
  42: fixImageUrl,
  43: removeUnusedElement,
  44: removeContext,
  45: setDisplayNoneWhenNoStyles,
  47: mapFillData,
  49: borderColorToRGBA,
  50: animationLoopIteration,
  52: mapBorderToNewModel,
  53: changeNameProperty,
  58: pebPositionModel,
  59: pebFillScaleModel,
  60: textStyleMigration,
  61: textDifferentScreens,
  62: triggerEnumUpdate,
  63: renderConfigModel,
};

export const lastMigrationVersion = Number(Object.keys(migrations).slice(-1));

export async function runMigrations(env: any, page: any, options?: any) {
  if (env && !loader.environment) {
    loader.environment = env;
  }

  await Promise.all(Object.entries(migrations).map(async ([version, migration]) => {
    await Promise.all(page.elements.map(async (elm: any) => {
      try {
        if ((elm.data?.version ?? 0) < version) {
          await migration(elm, page, { ...options, env });
        }
      } catch (err: any) {
        console.error(`Migration ${version} failed on element ${elm.id}: ${err.message}`);
      }
    }));
  }));

  return page;
}
