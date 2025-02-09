import {Component, OnInit, Input, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'pe-feedback',
  templateUrl: 'feedback.component.html',
  styleUrls: ['feedback.component.scss']
})

export class FeedbackComponent implements OnInit, AfterViewInit {

  @Input() feedbackId: string = 'feedback';
  @Input() value: string = '';
  @Input() maxLength: number = 10000;
  @Input() minHeight: number = 74;
  @Input() maxHeight: number = 162;
  @Input() placeholderText: string = 'Enter your text';
  @Input() autoFocus: boolean = false;

  @Output() feedbackValueChange: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('input', { static: true }) input: ElementRef;

  focused: boolean = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.input.nativeElement.setAttribute(
        'style',
        `height: ${this.input.nativeElement.scrollHeight}px;
        min-height: ${this.minHeight}px;
        max-height: ${this.maxHeight}px`);
  }

  ngAfterViewInit(): void {
    if (this.autoFocus) {
      this.input.nativeElement.focus();
    }
  }

  onInput(): void {
    this.value = this.input.nativeElement.value;
    this.input.nativeElement.style.height = 'auto';
    this.input.nativeElement.style.height = `${this.input.nativeElement.scrollHeight}px`;
    this.feedbackValueChange.emit(this.value);
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
  }

}
