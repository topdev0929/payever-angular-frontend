import { Component, Input, OnInit } from '@angular/core';
import { values } from 'lodash-es';

import { JsDocService } from '../../services';

@Component({
  selector: 'component-api-renderer',
  templateUrl: 'component-api-renderer.component.html'
})
export class ComponentApiRendererComponent implements OnInit {

  @Input() path: string;

  className: string;
  selector: string;
  properties: any[];
  accessors: any[];
  methods: any[];
  hasComponentData: boolean = null;

  private componentData: any;

  constructor(
    private docService: JsDocService,
  ) {}

  ngOnInit(): void {
    this.componentData = this.docService.getClassDataByPath(this.path);

    if (this.componentData) {
      this.className = this.componentData.name;
      this.selector = this.getSelector();
      this.properties = this.docService.getComponentProperties(this.componentData);
      this.accessors = this.docService.getComponentAccessors(this.componentData);
      this.methods = this.docService.getMethods(this.componentData);
      this.hasComponentData = true;
    } else {
      this.hasComponentData = false;
    }
  }

  getSelector(): string {
    if ( this.docService.getDecoratorSelector(this.componentData) ) {
      return this.docService.getDecoratorSelector(this.componentData)['selector'];
    }
    return '';
  }

  getPropertyDecoratorFormatted(decorator: any): string {
    return `@${decorator.name}(${values(decorator.arguments).join(', ')})`;
  }

  getAccessorTypeFormatted(accessorSignature: any): string {
    return (
      accessorSignature.parameters && accessorSignature.parameters.length
    ) ?
      accessorSignature.parameters.map(({ name, type }: any) => `${name}: ${type.name}`).join(', ') :
      '';
  }

  getPropertyTypeFormatted(type: any): string {
    let typeString: string;

    if (type.name) {
      typeString = type.name;
      if (type.typeArguments) {
        typeString += `<${
          type.typeArguments.map((typeItem: any) => this.getPropertyTypeFormatted(typeItem)).join(', ')
        }>`;
      }
    } else if (type.value) {
      typeString = type.value;
    } else if (type.types) {
      // type: union
      typeString = type.types.map((typeItem: any) => this.getPropertyTypeFormatted(typeItem)).join(' | ');
    }

    return typeString;
  }

  getMethodTypeFormatted(signatures: any): string {
    return (
      signatures.length !== 0
      && signatures[0].type
      && signatures[0].type.lenght !== 0
    ) ?
      signatures[0].type.name :
      void 0;
  }

  getMethodParamsTypeFormatted(signatures: any): string {
    return `(${
      (
        signatures.lenght !== 0
        && signatures[0].parameters
        && signatures[0].parameters.lenght !== 0
      ) ?
        signatures[0].parameters
          .map((param: any) => `${param.name}: ${param.type.name}`)
          .join(', ') :
        ''
      })`;
  }

}
