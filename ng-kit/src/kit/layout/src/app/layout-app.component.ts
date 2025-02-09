import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-layout-app',
  styleUrls: ['layout-app.component.scss'],
  templateUrl: './layout-app.component.html'
})
export class LayoutAppComponent {
  @Input() backgroundImageUrl: string;
  @Input() modifier: string;
  @Input() noPadding: boolean = false;
  @Input() noHeaderBorder: boolean = false;
  @Input() fullView: boolean = false;
  @Input() staticBlockView: boolean = false;
  @Input() fixedPositionView: boolean = false;
  @Input() headerTransparent: boolean = false;
  @Input() headerLightGrey: boolean = false;
  @Input() showBusinessHeader: boolean = false;
  @Input() withClose: boolean;
  @Input() businessHeaderHeight: number = 55;

  @Input() set showHeader(showHeader: boolean) {
    this.hasHeaderValue = showHeader;
  }
  get showHeader(): boolean {
    return this.hasHeaderValue;
  }

  @Input() set showToolbar(showToolbar: boolean) {
    this.hasToolbarValue = showToolbar;
  }
  get showToolbar(): boolean {
    return this.hasToolbarValue || this.withClose;
  }

  @Output('onClose') onClose: EventEmitter<void> = new EventEmitter<void>();

  private hasHeaderValue: boolean = false;
  private hasToolbarValue: boolean = false;

  onClosing(): void {
    this.onClose.emit();
  }

  getClassNameWithModifier(classname: string): string {
    return this.modifier ? `${classname}-${this.modifier}` : '';
  }
}
