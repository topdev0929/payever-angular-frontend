import { StylesSettingsInterface } from '../../../interfaces';

import { ScreenTypeEnum } from './enums';

export const CORNERS = ['4px', '12px', '50px', '0px'];
export const CORNERS_ICONS = {
  '4px': '#icon-corner-round-25',
  '12px': '#icon-corner-circle-25',
  '50px': '#icon-corner-arc-25',
  '0px': '#icon-corner-square-25',
};

export const ALIGNMENTS = {
  left: '#icon-alignment-left-25',
  center: '#icon-alignment-center-25',
  right: '#icon-alignment-right-25',
};


function DefaultSettingsForAllScreenTypes(entries: {
  prefix: string,
  suffix: string,
  value: string | number
}[]) {
  return entries.reduce((acc, { prefix, suffix, value }) => {
    Object.values(ScreenTypeEnum).forEach((screenType) => {
      acc[`${prefix}${screenType}${suffix}`] = value;
    });

    return acc;
  }, {});
}


export const DEFAULT_STYLES: StylesSettingsInterface = {
  businessHeaderBackgroundColor: '#ffffff',
  businessHeaderBorderColor: '#dfdfdf',

  ...DefaultSettingsForAllScreenTypes([
    { prefix: 'businessHeader', suffix: 'Height', value: '55px' },
  ]),

  ...DefaultSettingsForAllScreenTypes([
    { prefix: 'businessLogo', suffix: 'Width', value: '0px' },
    { prefix: 'businessLogo', suffix: 'Height', value: '0px' },
    { prefix: 'businessLogo', suffix: 'PaddingTop', value: '0px' },
    { prefix: 'businessLogo', suffix: 'PaddingBottom', value: '0px' },
    { prefix: 'businessLogo', suffix: 'PaddingRight', value: '0px' },
    { prefix: 'businessLogo', suffix: 'PaddingLeft', value: '0px' },
    { prefix: 'businessLogo', suffix: 'Alignment', value: 'left' },
  ]),

  buttonBackgroundColor: '#333333',
  buttonBackgroundDisabledColor: '#656565',
  buttonTextColor: '#ffffff',
  buttonBorderRadius: CORNERS[0],

  buttonSecondaryBackgroundColor: '#ffffff',
  buttonSecondaryBackgroundDisabledColor: '#656565',
  buttonSecondaryTextColor: '#0084ff',
  buttonSecondaryBorderRadius: CORNERS[0],

  pageBackgroundColor: '#ffffff',
  pageLineColor: '#dfdfdf',
  pageTextPrimaryColor: '#777777',
  pageTextSecondaryColor: '#8e8e8e',
  pageTextLinkColor: '#444444',

  inputBackgroundColor: '#ffffff',
  inputBorderColor: '#dfdfdf',
  inputTextPrimaryColor: '#3a3a3a',
  inputTextSecondaryColor: '#999999',
  inputBorderRadius: CORNERS[0],
};
