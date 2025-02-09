import { Component, ElementRef, ViewChild } from '@angular/core';
import { PasscodeService } from '../../../../../modules';

@Component({
  selector: 'doc-passcode',
  templateUrl: 'passcode-doc.component.html'
})
export class PasscodeDocComponent {
  htmlExample: string =  require('raw-loader!./examples/passcode-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/passcode-example-basic.ts.txt');

  @ViewChild('mainContentWrap') mainContentWrapRef: ElementRef;
  backgroundImage: string = require('../../../assets/img/background_jpg_ed4f73.jpg');

  constructor( private passcodeService: PasscodeService) {}

  toggleBuzz(): void {
    
    this.passcodeService.buzz();
  }

  handleOnDial(passcode: number[]): void {
    
  }

  handleOnRemove(passcode: number[]): void {
    
  }

  handleOnReset(): void {
    
  }

  handleOnCancel(): void {
    
  }

  handleOnSave(): void {
    
  }

  stopBubbling(e: MouseEvent): void {
    e.stopPropagation();
  }
}
