import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PasscodeService } from './passcode.service';
import { peVariables, PeVariablesInterface } from '../../pe-variables';

@Component({
  selector: 'pe-passcode',
  templateUrl: 'passcode.component.html',
  styleUrls: ['passcode.component.scss']
})

export class PasscodeComponent implements OnInit {

  @Input() codeLength: number = 4;
  @Input() title: string;
  @Input() labelCancel: string = 'Cancel';
  @Input() labelSave: string = 'Save new passcode';
  @Input() newPasscode: boolean = false;
  @Input() onlyPad: boolean = false;
  @Input() withDot: boolean = false;
  @Input() darkTheme: boolean = false;
  @Input() labelError: string;
  @Output('onDial') dialedCode: EventEmitter<number[]> = new EventEmitter();
  @Output('onReset') reseted: EventEmitter<boolean> = new EventEmitter();
  @Output('onRemove') removed: EventEmitter<number[]> = new EventEmitter();
  @Output('onCancel') canceled: EventEmitter<boolean> = new EventEmitter();
  @Output('onSave') saved: EventEmitter<boolean> = new EventEmitter();

  public peVariables: PeVariablesInterface = peVariables;
  private shouldBuzz: boolean;
  private passcode: number[];
  private currentPosition: number = 0;

  constructor( private passcodeService: PasscodeService ) {
    this.passcodeService.passcodeBuzzedEvent.subscribe(() => this.buzz());
  }

  ngOnInit(): void {
    this.passcode = new Array(this.codeLength);
  }

  dial(num: number): void {
    if ( this.currentPosition < this.codeLength ) {
      this.passcode[this.currentPosition] = num;
      ++this.currentPosition;

      this.dialedCode.emit(this.passcode);
    }
  }

  remove(): void {
    if ( this.currentPosition !== 0 ) {
      this.passcode[--this.currentPosition] = null;
    }
    this.removed.emit(this.passcode);
  }

  reset(): void {
    this.currentPosition = 0;
    for (let i: number = 0; i < this.passcode.length; ++i) {
      this.passcode[i] = null;
    }
    this.reseted.emit(true);
  }

  buzz: Function = function(): void {
    this.shouldBuzz = true;
    setTimeout(() => { this.shouldBuzz = false; }, this.peVariables.pe_duration_slide_out.replace(/\D/g,'') * 2 );
  };

  save(): void {
    this.saved.emit(true);
  }

  cancel(): void {
    this.reset();
    this.canceled.emit(true);
  }

  onTouchEnd(event: TouchEvent, num: number): void {
    event.preventDefault();
    this.dial(num);
  }
}
