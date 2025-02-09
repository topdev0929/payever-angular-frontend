import { isPlatformServer } from '@angular/common';
import { Directive, Inject, Input, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Renders element only on server (server-side rendering)
 */
@Directive({
  selector: '[peOnlyServerRender]'
})
export class OnlyServerRenderDirective {

  @Input() peOnlyServerRender: boolean = true;

  readonly defaultValue: boolean = true;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  private get value(): boolean {
    // NOTE: this.peNotServerRender == null if value not specified for directive (usage *peNotServerRender)
    // tslint:disable-next-line:triple-equals
    return this.peOnlyServerRender == null ? this.defaultValue : this.peOnlyServerRender;
  }

  ngOnInit(): void {
    if (this.value) {
      if (isPlatformServer(this.platformId)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
      else {
        this.viewContainer.clear();
      }
    }
  }

}
