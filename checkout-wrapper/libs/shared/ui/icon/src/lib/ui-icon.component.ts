import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pe-icon',
  template: `
    <mat-icon>
      <svg class="icon icon-24">
        <use
          xmlns:xlink="http://www.w3.org/1999/xlink"
          [attr.xlink:href]="'#' + icon">
        </use>
      </svg>
    </mat-icon>
  `,
})
export class UiIconComponent implements OnInit {
  @Input() icon: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
    this.cdr.detach();
  }
}
