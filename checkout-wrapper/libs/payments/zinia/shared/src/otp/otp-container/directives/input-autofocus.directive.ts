import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { first, tap } from 'rxjs/operators';

@Directive({
  selector: '[peAutoFocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit, OnChanges {
  @Input() public peAutoFocus: boolean;

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.peAutoFocus && this.peAutoFocus) {
      this.setFocus();
    }
  }

  public ngAfterViewInit() {
    if (this.peAutoFocus) {
      this.setFocus();
    }
  }

  private setFocus() {
    const inputNode = this.el.nativeElement.tagName === 'INPUT'
      ? this.el.nativeElement
      : this.el.nativeElement.querySelector('input');
    if (inputNode) {
      this.ngZone.onStable.pipe(
        first(),
        tap(() => inputNode.focus())
      ).subscribe();
    }
  }
}
