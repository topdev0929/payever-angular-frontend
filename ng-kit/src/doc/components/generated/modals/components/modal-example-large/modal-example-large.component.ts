import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  templateUrl: 'modal-example-large.component.html'
})
export class ModalExampleLargeComponent {

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
