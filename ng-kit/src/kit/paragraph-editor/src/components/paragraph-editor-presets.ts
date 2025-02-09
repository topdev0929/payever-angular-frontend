import { ParagraphEditorGroupActionInterface } from '../..';

export const UI_PARAGRAPH_EDITOR_PRESETS: ParagraphEditorGroupActionInterface[]  = [
  {
    icon: '#icon-ep-space',
    iconSize: 24,
    isSelected: true,
    allowMultipleSelect: false,
    actions: [
      {
        icon: '#icon-ep-space-centered',
        iconSize: 32,
        isActive: true,
        cssClass: 'ui-paragraph-editor-full-width'
      },
      {
        icon: '#icon-ep-space-medium',
        iconSize: 32,
        isActive: false,
        cssClass: 'ui-paragraph-editor-medium-width'
      },
      {
        icon: '#icon-ep-space-small',
        iconSize: 32,
        isActive: false,
        cssClass: 'ui-paragraph-editor-small-width'
      }
    ]
  },
  {
    icon: '#icon-sb-align-center-32',
    iconSize: 24,
    isSelected: false,
    allowMultipleSelect: false,
    actions: [
      {
        icon: '#icon-sb-align-left-32',
        iconSize: 32,
        isActive: false,
        cssClass: 'text-left'
      },
      {
        icon: '#icon-sb-align-center-32',
        iconSize: 32,
        isActive: false,
        cssClass: 'text-center'
      },
      {
        icon: '#icon-sb-align-right-32',
        iconSize: 32,
        isActive: false,
        cssClass: 'text-right'
      }
    ]
  }
];
