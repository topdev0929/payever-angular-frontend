import { Injectable } from '@angular/core';

// tslint:disable-next-line no-var-requires
const docData: any = require('../../../../../jsdoc/doc.json');

@Injectable()
export class JsDocService {

  private componentDecoratorSelectorRE: RegExp = /selector:(?:\s+)?(?:'|"|`)([^'"`]+)/m;

  getClassDataByPath(path: string): any {
    try {
      const picked = this.pickKindString(
        'Class',
        docData.children.find(
          (node: any) => {
            return node.name === `"src/kit/${path}"` || node.name === `"${path}"`;
          }
        )
      );
      return picked && picked[0] ? picked[0] : '';
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error('Cant get class from path', path, e);
    }
    return '';
  }

  getDecoratorSelector(classData: any): string {
    try {
      if (classData.decorators) {
        const decorator: string = classData.decorators[0].arguments.obj;
        if (!decorator) {
          return '';
        } else {
          const matched: RegExpMatchArray = decorator.match(this.componentDecoratorSelectorRE);
          return matched && matched[1] || '';
        }
      }
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error('Cant get decorator data by error', e, 'from', classData);
    }
    return '';
  }

  getComponentProperties(classData: any): any {
    try {
      return this.pickKindString('Property', classData);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error('Cant get component properties', classData, e);
    }
  }

  getComponentAccessors(classData: any): any {
    try {
      return this.pickKindString('Accessor', classData);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error('Cant get component properties', classData, e);
    }
  }

  getMethods(classData: any): any {
    try {
      return this.pickKindString('Method', classData);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error('Cant get methods', classData, e);
    }
  }

  pickKindString(kindString: string, classData: any): any {
    return classData && classData.children ?
      classData.children
        .filter((node: any) => node.kindString === kindString)
        .filter(this.filterPublic) :
      null;
  }

  filterPublic(node: any): boolean {
    return !node.flags.isPrivate && !node.flags.isProtected ? true : false;
  }
}
