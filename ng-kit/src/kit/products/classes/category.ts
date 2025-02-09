// @TODO moved from store. Clean up version in store.

import { guid } from '../../guid';

import { CategoryHeaderLogoInterface, CategoryInterface, CategoryTextStyleInterface } from '../interfaces';
import { CategoryType } from '../enums';
// import { defaultOverlayFontSize } from '../settings';

/* tslint:disable:variable-name */

export class Category implements CategoryInterface {
  public guid: string;
  public opacity: string;
  public position: number = 0;

  /**
   * Required
   */
  public name: string;

  /**
   * Text that is shown in category header. Not required
   */
  public header_title: string;
  // @TODO why we need widget???
  // public selection_type: 'all' | 'taxonomy' | 'manual' | 'widget';
  public selection_type: CategoryType;
  public color: string;
  public id: string;
  public taxonomy_ids: string[];
  public item_ids: string[];
  public logo: CategoryHeaderLogoInterface;
  public text_style: CategoryTextStyleInterface;
  public is_show_in_list: boolean = true;

  constructor(options: CategoryInterface = {}) {
    options.position = options.position || 0;
    options.guid = options.guid || guid();
    options.text_style = options.text_style || {
      bold: false,
      italic: false,
      underline: false,
      fontSize: null
    };
    options.name = options.name || '(empty title)';
    options.header_title = options.header_title || options.header_title === '' ?
      options.header_title : options.name;
    options.item_ids = options.item_ids ? options.item_ids.filter((n: string) => n) : [];
    options.color = '#ffffff';
    options.opacity = '0';
    Object.assign(this, options);
  }

  static isCreatedOnServer(category: CategoryInterface): boolean {
    // only categories saved on backend have ID
    return category && category.id != null; /* tslint:disable-line:triple-equals */
  }
}

