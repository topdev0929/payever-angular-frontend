import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { ModalButtonListInterface } from '../../../../../../kit/modal';

@Component({
  templateUrl: 'modal-example-small.component.html'
})
export class ModalExampleSmallComponent {

  hider: Subject<boolean> = new Subject();

  loading: boolean = false;
  bodyZeroPadding: boolean = false;
  backgroundStyle: {} = {};
  backgroundImage: string = require('../../../../../assets/img/background_jpg_ed4f73.jpg');

  buttons: ModalButtonListInterface = {
    'close': {
      title: 'Close me'
    },
    'testl': {
      title: 'Test loading',
      click: () => this.loading = true,
      classes: 'btn-primary btn-link'
    },
    'testb': {
      title: 'Test background',
      click: () => {
        this.backgroundStyle = {
          'background': 'url(' + this.backgroundImage + ')'
        };
      },
      classes: 'btn-primary btn-link'
    },
    'testz': {
      title: 'Test bodyZeroPadding',
      click: () => this.bodyZeroPadding = true,
      classes: 'btn-primary btn-link'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  back(): void {
    this.router.navigate(['../..'], {relativeTo: this.route});
  }

  hide(): void {
    this.hider.next(true);
  }
}
