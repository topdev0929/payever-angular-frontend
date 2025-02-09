import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';


@Component({
  selector: 'password-must',
  templateUrl: './password-must.component.html',
  styleUrls: ['./password-must.component.scss'],
  animations: [
    trigger('trigger', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('* <=> *', [animate('0.15s cubic-bezier(0.4, 0, 1, 1)')]),
    ]),
  ],
})
export class PasswordMustComponent implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();

  @Input() control: FormControl;
  @Input() focused: BehaviorSubject<boolean>;
  @Input() show = false;

  @Output() done = new EventEmitter();

  list = [
    { label: 'password.tooltip.min_length', active: false },
    { label: 'password.tooltip.letters', active: false },
    { label: 'password.tooltip.number', active: false },
    { label: 'password.tooltip.spec_char', active: false },
  ];

  ngOnInit() {
    this.focused.pipe(
      tap((value: boolean) => {
        this.show = this.list.every(item => item.active !== true) && value;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.control.valueChanges.pipe(
      tap((value) => {
        this.checkList(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  checkList(value: string) {
    this.list[0].active = value.length >= 8;
    this.list[1].active = !!(/[A-Z]/.exec(value) && /[a-z]/.exec(value))
    this.list[2].active = !!/\d/.exec(value)
    this.list[3].active = !!/[!@#$%^&*(),.?":{}|<>]/.exec(value)

    this.show = this.list.some(item => item.active !== true);
  }
}
