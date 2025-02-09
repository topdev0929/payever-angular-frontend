// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { lastMigrationVersion } from '@pe/builder/migrations';

import { PebDefaultScreens, PEB_ROOT_SCREEN_KEY, PEB_WHITE_RGBA } from '../constants';
import {
  PebDefaultLanguageSetting,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebFillType,
  PebPageVariant,
  PebScreen,
  PebSolidFill,
  PebTheme,
  PebUnit,
  PebValueByScreen,
} from '../models';
import { pebGenerateId } from '../utils';

export enum PebSectionType {
  Header = 'header',
  Body = 'body',
  Footer = 'footer',
}

export const createEmptyDocument = (): PebElementDef => {
  const fill: PebSolidFill = { type: PebFillType.Solid, color: PEB_WHITE_RGBA };

  return {
    id: pebGenerateId(),
    index: 0,
    type: PebElementType.Document,
    data: { version: lastMigrationVersion },
    prev: null,
    next: null,
    styles: {
      [PEB_ROOT_SCREEN_KEY]: { fill },
    },
    changeLog: { version: 0 },
  };
};

export const createEmptySections = (parentId: string, screens: PebScreen[]): PebElementDef[] => {
  return createSectionsByTemplate(
    [
      { name: 'Header', height: 200 },
      { name: 'Body', height: 600 },
      { name: 'Footer', height: 200 },
    ],
    parentId,
    screens,
  );
};

export const createEmptyMasterSections = (parentId: string, screens: PebScreen[]): PebElementDef[] => {
  return createSectionsByTemplate(
    [
      { name: 'Header Master', height: 200 },
      { name: 'Footer Master', height: 200 },
    ],
    parentId,
    screens,
  );
};

export const createEmptyPage = (name: string, variant: PebPageVariant = PebPageVariant.Default): any => {
  return {
    id: pebGenerateId(),
    name,
    variant,
    next: null,
    prev: null,
    versionNumber: 1,
  };
};

export function createEmptyTheme(name: string): PebTheme {
  return {
    id: pebGenerateId(),
    name,
    publishedVersion: 0,
    data: {
      productPages: '/products/:productId',
      categoryPages: '/categories/:categoryId',
    },
    screens: PebDefaultScreens,
    language: PebDefaultLanguageSetting,
    versionNumber: 0,
    undo: '',
    presets: { animations: {} },
  };
}

function createSectionsByTemplate(
  template: { name: string, height: number }[],
  parentId: string,
  screens: PebScreen[]
): PebElementDef[] {
  const sections: PebElementDef[] = [];
  const originScreen = screens.find(scr => scr.key === PEB_ROOT_SCREEN_KEY) ?? screens[0];

  template.forEach(({ name, height }) => {
    const section = {
      id: pebGenerateId(),
      name,
      index: 0,
      type: PebElementType.Section,
      data: { version: lastMigrationVersion },
      meta: { deletable: false },
      parent: { id: parentId, type: PebElementType.Document },
      styles: {} as PebValueByScreen<Partial<PebElementStyles>>,
      prev: null,
      next: null,
    };

    screens.forEach((screen) => {
      const scale = screen.width / originScreen.width;
      section.styles[screen.key] = { dimension: { height: { value: height * scale, unit: PebUnit.Pixel } } };
    });

    sections.push(section);
  });

  sections.forEach((section, index) => {
    section.prev = sections[index - 1]?.id;
    section.next = sections[index + 1]?.id;
  });

  return sections;
}
