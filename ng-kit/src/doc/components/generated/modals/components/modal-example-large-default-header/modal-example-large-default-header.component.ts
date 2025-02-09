import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  templateUrl: 'modal-example-large-default-header.component.html'
})
export class ModalExampleLargeDefaultHeaderComponent {

  hider: Subject<boolean> = new Subject();

  loading: boolean = false;
  bodyZeroPadding: boolean = false;

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
