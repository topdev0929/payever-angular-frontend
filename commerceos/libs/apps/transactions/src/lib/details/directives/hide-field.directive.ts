import {
  AfterViewInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  ViewContainerRef,
} from "@angular/core";

import { HIDDEN_VALUE, HiddenValueComponent } from "../../shared";
import { DetailService } from "../services";

@Directive({
  selector: '[peHideAnonymizedField]',
})
export class HideAnonymizedFieldDirective implements AfterViewInit {

  public isHidden = false;

  constructor(
    public element: ElementRef,
    protected injector: Injector,
    private detailService: DetailService,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngAfterViewInit(): void {
    if (this.element.nativeElement?.innerText?.includes(HIDDEN_VALUE)) {
      this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
      this.viewContainerRef.clear();

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(HiddenValueComponent);
      const component = this.viewContainerRef.createComponent(componentFactory, 0, this.injector);
      component.hostView.detectChanges();
      this.cdr.detectChanges();
    }
  }
}
