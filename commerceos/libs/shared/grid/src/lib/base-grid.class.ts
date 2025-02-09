import { Directive } from '@angular/core';

@Directive()
export class BaseGridClassDirective {
  findCategory(categories, folderIdStorage) {
    let category = categories.find(item => item._id === folderIdStorage);

    if (!category) {
      let i = 0;
      while (!category && categories[i]?.children?.length > 0) {
        category = this.findCategory(categories[i].children, folderIdStorage);
        i += 1;
      }
    }

    return category;
  }
}
