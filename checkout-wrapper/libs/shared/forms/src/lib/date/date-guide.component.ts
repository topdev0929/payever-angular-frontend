import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';

export enum PeDatePickerMaskType {
  shortDate = 'shortDate',
  fullDate = 'fullDate',
}

@Component({
  selector: 'pe-date-mask-guide',
  template: `
      <ng-container *ngIf="show">
          <span 
          *ngFor="let item of fragments;"
          [ngClass]="{
            'pe-date-mask-guide-separator': item === separator,
          }"
          >{{item}}</span>
        <span
          [ngStyle]="{font}" 
          id="hiddenSpan"
          #hiddenSpan
        >{{ hiddenSpanText }}</span>
      </ng-container>
    `,
  styles: [`
    #hiddenSpan {
      opacity: 0;
      display: inline-block;
    }
    :host {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      color: rgba(17, 17, 17, 0.4);
    }
    span.pe-date-mask-guide-separator {
      color: rgba(17, 17, 17, 0.85);
    }
  `],
  imports: [CommonModule],
  standalone: true,
})
export class DatePickerMaskGuideComponent {
  public fragments: string[];

  private cdr = inject(ChangeDetectorRef);

  protected text: string;
  protected hiddenSpanText: string;

  @ViewChild('hiddenSpan')
  private hiddenSpan: ElementRef<HTMLSpanElement>;

  @Input() show: boolean;
  @Input() font: string;
  @Input() separator: string;
  @Input() peDatePickerMask: keyof typeof PeDatePickerMaskType;
  @Input()
  set setText(text: string) {
    this.fragments = text.split(new RegExp(`(\\${this.separator})`));
  }

  getHiddenSpanWidth(text: string): number {
    this.hiddenSpanText = text;
    this.cdr.detectChanges();

    return this.hiddenSpan?.nativeElement.clientWidth;
  }
}