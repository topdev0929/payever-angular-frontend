import {
  Directive,
  ElementRef,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[scrollEndDetection]',
})
export class ScrollEndDetectionDirective implements OnInit {

  @Input() heightDiff: number = 100;
  @Output() scrollEnd: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() scrollTop: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() scrollPosition: EventEmitter<number> = new EventEmitter<number>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    fromEvent(this.elementRef.nativeElement, 'scroll')
      .pipe(debounceTime(100))
      .subscribe((event: Event) => {
        const element: HTMLElement = event.target as HTMLElement;
        this.scrollPosition.emit(element.scrollTop);
        if (element.scrollHeight <= element.clientHeight + element.scrollTop + this.heightDiff) {
          this.scrollEnd.emit(true);
        }
        if (element.scrollTop < this.heightDiff) {
          this.scrollTop.emit(true);
        }
      });
  }
}
