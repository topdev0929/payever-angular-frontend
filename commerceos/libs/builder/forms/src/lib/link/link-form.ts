import {
  isMasterPage,
  PebElementDef,
  PebLink,
  PebLinkTarget,
  PebLinkType,
  PebPage,
  SelectOption,
  stringToEnum,
} from '@pe/builder/core';

export enum PebLinkFormPayloadType {
  Input = 'input',
  Select = 'select',
}

export interface PebLinkFormCommon {
  label: string;
  type: PebLinkFormPayloadType | string;
  controlName?: string;
  placeholder?: string;
  valuePrefix?: string;
}

export interface PebLinkFormInput extends PebLinkFormCommon {
  changeType: 'focusout' | 'keyup';
}

export interface PebLinkFormSelect extends PebLinkFormCommon {
  options: SelectOption[];
}

export type PebLinkFormField = PebLinkFormInput | PebLinkFormSelect | PebLinkFormCommon;

export interface PebLinkFormOptions {
  name: string;
  value: PebLinkType | string;
  payload: PebLinkFormField[];
}

export const linkFormOptions: PebLinkFormOptions[] = [
  {
    name: 'None',
    value: null,
    payload: null,
  },
  {
    name: 'Page',
    value: PebLinkType.InternalPage,
    payload: [
      {
        label: 'Link Payload',
        type: 'select',
        options: [],
        controlName: 'pageId',
      },
      {
        label: 'Anchor Payload',
        type: 'select',
        options: [],
        controlName: 'anchorElement',
      },
    ],
  },
  {
    name: 'Anchor',
    value: PebLinkType.Anchor,
    payload: [
      {
        label: 'Anchor',
        type: 'select',
        options: [],
        controlName: 'anchorElementId',
      },
    ],
  },
  {
    name: 'Custom Link',
    value: PebLinkType.ExternalUrl,
    payload: [
      {
        label: 'Link',
        type: 'input',
        controlName: 'url',
        changeType: 'focusout',
      },
      {
        label: 'Target',
        type: 'select',
        options: [
          { name: 'Self', value: PebLinkTarget.Self },
          { name: 'Blank', value: PebLinkTarget.Blank },
        ],
        controlName: 'target',
        placeholder: 'Self',
      },
    ],
  },
];

export const getLinks = (pages: PebPage[], elementsByName: Map<string, PebElementDef>, linkData: PebLink = null) => {
  const acc = [];
  const linkablePages = pages.filter(page => !isMasterPage(page));

  for (const link of linkFormOptions) {
    const fields = (link.payload ?? []).map((field) => {
      if (field.type === 'select') {
        const type = stringToEnum(link.value, PebLinkType);
        if (type === PebLinkType.InternalPage) {
          if (field.controlName === 'pageId') {
            /** iterate over pages to keep order */
            const options = [...linkablePages].reduce((acc, page) => {
              const route = linkablePages.find(p => p.id === page.id);
              if (route) {
                const optionName = `${page.name} ${route.url ? '(' + route.url + ')' : ''}`;

                acc.push({ name: optionName, value: route.id });
              }

              return acc;
            }, []);

            return { ...field, options };
          }

          if (
            field.controlName === 'anchorElement' &&
            linkData?.type === PebLinkType.InternalPage &&
            linkData?.pageId
          ) {
            const anchorPage = pages.find(p => p.id === linkData.pageId);
            const anchorElement = anchorPage
              ? Object.values(anchorPage.element??{}).filter(elm => !elm.deleted && elm.name)
              : [];
            const options = anchorElement.map(element => ({ name: element.name, value: element.id }));

            return { ...field, options };
          }
        }

        if (type === PebLinkType.Anchor) {
          const options = [...elementsByName].reduce((acc, [name, element]) => {
            acc.push({ name, value: element.id });

            return acc;
          }, []);

          return { ...field, options };
        }
      }

      return field;
    });

    acc.push({ ...link, payload: fields });
  }

  return acc;
};
