import { isPlatformServer } from '@angular/common';
import { Directive, Inject, Input, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Prevent rendering of element on server (server-side rendering)
 */
@Directive({
  selector: '[peNotServerRender]'
})
export class NotServerRenderDirective {

  @Input() peNotServerRender: boolean = true;

  readonly defaultValue: boolean = true;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  private get value(): boolean {
    // NOTE: this.peNotServerRender == null if value not specified for directive (usage *peNotServerRender)
    // tslint:disable-next-line:triple-equals
    return this.peNotServerRender == null ? this.defaultValue : this.peNotServerRender;
  }

  ngOnInit(): void {
    if (this.value) {
      if (isPlatformServer(this.platformId)) {
        this.viewContainer.clear();
      }
      else {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    }
  }

}
