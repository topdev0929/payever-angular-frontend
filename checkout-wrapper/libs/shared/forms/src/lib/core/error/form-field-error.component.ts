import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { AbstractControl, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';


import { FormFieldErrorStylesComponent } from './form-field-error.styles';
import { ParseErrorPipe } from './parse-error.pipe';

@Component({
  selector: 'pe-error',
  template: `
  <pe-error-styles></pe-error-styles>
  <mat-error>
    <ng-container *ngFor="let error of (fromControl.errors | keyvalue)?.slice(0, 1)">
      {{ error | parseError: label }}
    </ng-container>
  </mat-error>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,

    MatFormFieldModule,
    ParseErrorPipe,
    FormFieldErrorStylesComponent,
  ],
  providers: [
    ParseErrorPipe,
  ],
  animations: [
    trigger(
      'dropIn',
      [
        state('in', style({ top: '-10px', opacity: '1' })),
        state('out', style({ top: '-15px', opacity: '0' })),
        transition(
          'in => out',
          [
            animate('250ms ease'),
          ],
        ),
        transition(
          'out => in',
          [
            animate('250ms ease'),
          ],
        ),
      ],
    ),
  ],
})
export class FormFieldErrorComponent {

  @HostBinding('@dropIn')
  get dropIn() {
    return this.getErrorState() ? 'in' : 'out';
  }

  @Input() label: string;

  @Input() fromControl: AbstractControl;
  @Input() getErrorState = () => false;

  constructor(
    public readonly cdr: ChangeDetectorRef,
    protected readonly formGroupDirective: FormGroupDirective,
  ) {}
}
