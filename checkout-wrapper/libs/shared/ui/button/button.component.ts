import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'ui-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutUiButtonComponent implements AfterViewInit {
  @Input() type: 'button' | 'reset' | 'submit' = 'button';

  @Input() skin: 'primary' | 'secondary' | 'cancel' | 'ignore-custom-styles';

  @Input() disabled: boolean;

  @Input() class: string;

  @Input() ariaLabel: string;


  @Input() disableRipple: boolean;

  @Output() click = new EventEmitter<MouseEvent>();

  @ViewChild(MatButton, { read: ElementRef }) buttonRef: ElementRef<HTMLButtonElement>;

  get className(): string {
    switch (this.skin) {
      case 'primary':
        return 'mat-button-gradient mat-button-lg';
      case 'secondary':
        return 'mat-button-secondary mat-button-lg';
      case 'cancel':
        return 'cancel mat-button-lg';
      case 'ignore-custom-styles':
        return 'ignore-custom-styles active';
      default:
        return '';
    }
  }

  @HostListener('click', ['$event']) clicked(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.buttonRef.nativeElement.childNodes.forEach((node) => {
      node.hasChildNodes() && this.renderer.setStyle((node as HTMLElement), 'pointer-events', 'none');
    });
  }
}
