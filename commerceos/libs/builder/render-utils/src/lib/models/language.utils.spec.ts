import { PebElementType, PebLanguageEnum } from '@pe/builder/core';
import { getText } from './language.utils';
import Delta from 'quill-delta';

const languages = [
  {
      title: 'English (United States)',
      key: 'en',
      active: true,
      locale: PebLanguageEnum.English
  }
]

describe('getText function', () => {
  it('should return undefined for Document, Section, and Grid elements', () => {
    const documentElement = { type: PebElementType.Document };
    const sectionElement = { type: PebElementType.Section };
    const gridElement = { type: PebElementType.Grid };

    expect(getText(documentElement, [])).toBeUndefined();
    expect(getText(sectionElement, [])).toBeUndefined();
    expect(getText(gridElement, [])).toBeUndefined();
  });

  it('should return text for other element types', () => {
    const text = 'This is a test';
    const paragraphElement = {
      'data': {
          'text':{
              'desktop': {
                  'en': new Delta([{ insert: '' }, {
                    'insert': `${text}\n`
                }])
              }
          },
      },
      'type': PebElementType.Shape,
  };

    expect(getText(paragraphElement, languages)).toEqual(`<p>${text}</p>`);
  });

  it('should render text according to the provided languages', () => {
    const text = 'Hello'
    const deltaText = new Delta([{ insert: text, attributes: { bold: true } }, { insert: '\n' }]);
    const element = { type: PebElementType.Text, data: { text: { desktop: { en: deltaText } } } };

    jest.mock('@pe/builder/delta-renderer', () => ({
      render: jest.fn(() => text),
    }));

    expect(getText(element, languages)).toEqual(`<p>${text}</p>`);
  });
});
