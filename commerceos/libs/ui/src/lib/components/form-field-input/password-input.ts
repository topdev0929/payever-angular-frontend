import { Directive, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PePasswordTooltipRef, PePasswordTooltipService } from './password-input-tooltip.service';

@Directive({
  selector: `input[pePasswordInput]`,
})
export class PePasswordInputDirective implements OnInit, OnDestroy {
  dialogRef: PePasswordTooltipRef;
  isFocused = new BehaviorSubject<boolean>(false);
  inputValue$ = new BehaviorSubject<string>('');
  inputEvent$;
  protected destroy$ = new Subject<void>();

  constructor(private elRef: ElementRef<HTMLInputElement>, private passwordTooltip: PePasswordTooltipService) {
  }

  @HostListener('focus', ['$event']) onFocus(e) {
    this.isFocused.next(true);
  }

  @HostListener('blur', ['$event']) onblur(e) {
    this.isFocused.next(false);
  }

  ngOnInit() {
    fromEvent(this.elRef.nativeElement, 'input').pipe(
      tap((event: any) => {
        const value = event.target.value;

        this.inputValue$.next(value);

        if (this.mustHave(value)) {
          if (this.dialogRef.isClose()) {
            this.dialogRef = this.passwordTooltip.open(this.elRef, this.inputValue$);
          }
        } else if (!this.dialogRef.isClose()) {
          this.dialogRef.close();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.isFocused.subscribe((value) => {
      if (value && this.mustHave(this.inputValue$.value)) {
        const twoCols = this.elRef.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        if (twoCols) {
          this.dialogRef = this.passwordTooltip.open(twoCols, this.inputValue$);
        } else {
          this.dialogRef = this.passwordTooltip.open(this.elRef, this.inputValue$);
        }
      } else if (this.dialogRef) {
        this.dialogRef.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private mustHave(value: string) {
    if (
      value.length >= 8 &&
      /[A-Z]/.exec(value) &&
      /[a-z]/.exec(value) &&
      /\d/.exec(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.exec(value)
    ) {
      return false;
    }

    return true;
  }
}
