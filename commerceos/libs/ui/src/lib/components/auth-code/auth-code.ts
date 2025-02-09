import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pe-auth-code',
  templateUrl: './auth-code.html',
  styleUrls: ['./auth-code.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeAuthCodeComponent implements OnInit {
  currentActive$: BehaviorSubject<number> = new BehaviorSubject(0);

  /** Sets number of digits */
  @Input() set numberOfDigits(value: number) {
    this.digitFormArray.reset([]);
    for (let i = 0; i < value; i += 1) {
      this.digitFormArray.push(new FormControl(''));
    }
  }

  @Input() numberOnly = true;
  @Input() type = 'text';
  @Input() autocomplete = 'off';

  /** Digits array */
  digitFormArray = this.fb.array([]);

  /** Emits value when changed */
  @Output() readonly changed: EventEmitter<string> = new EventEmitter<string>();

  constructor(private fb: FormBuilder) {}

  get inputMode(): string {
    return this.numberOnly ? 'numeric' : 'text';
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.digitFormArray.controls[this.currentActive$.value].value) {
      this.currentActive$.next(this.currentActive$.value - 1);
    }
  }

  onFocus(index: number) {
    this.currentActive$.next(index);
  }

  onValueChange(value: string, controlNumber: number) {
    // if user makes copy/paste the code
    if (!value) {
      return;
    }

    this.filter(value, controlNumber, this.numberOnly);
  }

  ngOnInit(): void {
    this.digitFormArray.valueChanges.subscribe((values) => {
      this.changed.emit(values.join(''));
    });
  }

  filter(value: string, inputIndex: number, numberOnly: boolean) {
    const regex = numberOnly ? /\D/gi : /[^a-zA-Z\d]/gi;
    const numberOfDigits = this.digitFormArray.controls.length;

    if (value.length > 1 && inputIndex === 0) {
      Object.keys(this.digitFormArray.controls).forEach((key, index) => {
        const char = (value[index] ?? '').replace(regex, '');
        this.digitFormArray.get(key).patchValue(char, {
          emitEvent: false,
        });
      });
      value.length > numberOfDigits
        ? this.currentActive$.next(numberOfDigits - 1)
        : this.currentActive$.next(value.length);
    } else {
      const char = value.replace(regex, '').charAt(0);
      this.digitFormArray.controls[inputIndex].patchValue(char, {
        emitEvent: false,
      });

      if (!!char && inputIndex < numberOfDigits - 1) {
        this.currentActive$.next(inputIndex + 1);
      }
    }
  }
}
