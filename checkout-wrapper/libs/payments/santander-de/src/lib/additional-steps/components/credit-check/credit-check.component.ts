import { Component, OnInit, inject } from '@angular/core';

import { INPUTS } from '../../injection-token.constants';
@Component({
  selector: 'santander-de-credit-check',
  template: '',
})
export class CreditCheckComponent implements OnInit {
  private inputs = inject(INPUTS);

  ngOnInit(): void {
    setTimeout(() => { this.inputs.next() }, 0);
  }
}
