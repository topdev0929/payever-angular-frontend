import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'peb-border-style-form',
  templateUrl: './border-style-form.component.html',
  styleUrls: ['./border-style-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBorderStyleFormComponent implements OnDestroy {

  @Input() formControl: FormControl;
  @Output() blurred = new EventEmitter<void>();

  readonly destroy$ = new Subject<void>();
  readonly borderStyles = [
    { value: 'solid' },
    { value: 'dotted' },
    { value: 'dashed' },
    { value: 'double' },
    { value: 'groove' },
  ];

  constructor(private elmRef: ElementRef) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  isSingleLineBorder(value) {
    return ['solid', 'dotted', 'dashed'].includes(value);
  }

  patchValue(value: string): void {
    this.formControl?.patchValue(value);
    this.elmRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
    this.blurred.emit();
  }
}
