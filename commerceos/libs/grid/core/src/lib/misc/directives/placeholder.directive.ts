import { ChangeDetectorRef, Component, ComponentFactoryResolver, Directive, ElementRef, Inject, Input, Optional, Renderer2, Type, ViewContainerRef } from "@angular/core";

import { PlaceholderCellInterface, PLACEHOLDER_COMPONENT } from "@pe/grid/shared";

import { PeGridTableDisplayedColumns } from "../interfaces";

interface PlaceholderInputInterface {
  column: PeGridTableDisplayedColumns;
  value: string;
}

@Directive({
  selector: '[placeholderValue]',
})
export class PlaceholderValueDirective {
  @Input() set placeholderValue(data: PlaceholderInputInterface) {
    data.value && this.checkPlaceholder(data);
  }

  constructor(
    private element: ElementRef,
    @Optional() @Inject(PLACEHOLDER_COMPONENT) private placeholderComponent: Type<Component>,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {

  }

  checkPlaceholder(data: PlaceholderInputInterface) {
    if (this.placeholderComponent && typeof data.column.placeholderCondition === 'function') {
      if (data.column.placeholderCondition(data.value)) {
        const componentFactory =  this.componentFactoryResolver.resolveComponentFactory(this.placeholderComponent);

        this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
        this.viewContainerRef.clear();
        const component = this.viewContainerRef.createComponent(componentFactory);
        (component.instance as PlaceholderCellInterface).listSizeIcon = true;
        this.cdr.detectChanges();
      }
    }
  }
}
