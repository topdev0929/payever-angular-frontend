import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'modals',
  templateUrl: 'modals.component.html'
})
export class ModalsComponent {

  // TODO copy *.html to *.html.txt on build (same for .ts). After that exclude from GIT.

  modalExampleSmallHtml: string = require('raw-loader!./modal-example-small/modal-example-small.component.html.txt');
  modalExampleSmallTs: string = require('raw-loader!./modal-example-small/modal-example-small.component.ts.txt');

  modalExampleConfirmHtml: string = require('raw-loader!./modal-example-confirm/modal-example-confirm.component.html.txt');
  modalExampleConfirmTs: string = require('raw-loader!./modal-example-confirm/modal-example-confirm.component.ts.txt');

  modalExampleNotificationWarningHtml: string = require('raw-loader!./modal-example-notification-warning/modal-example-notification-warning.component.html.txt');
  modalExampleNotificationWarningTs: string = require('raw-loader!./modal-example-notification-warning/modal-example-notification-warning.component.ts.txt');

  modalExampleLargeBlueHeaderHtml: string = require('raw-loader!./modal-example-large-blue-header/modal-example-large-blue-header.component.html.txt');
  modalExampleLargeBlueHeaderTs: string = require('raw-loader!./modal-example-large-blue-header/modal-example-large-blue-header.component.ts.txt');

  exampleTag: string = '<pe-modal></pe-modal>';
  routerOutletTag: string = '<router-outlet></router-outlet>';
  exampleModalOverContentRoutes: string = `
const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
    children: [
      {
        path: 'item',
        component: ItemModalComponent,
      },
    ],
  },
];`;

  modalExampleOverModalRoutesTs: string = require('raw-loader!./modal-in-modal/routes.ts.txt');
  modalExampleOverModalRootTs: string = require('raw-loader!./modal-in-modal/root.ts.txt');
  modalExampleOverModalRootHtml: string = require('raw-loader!./modal-in-modal/root.html.txt');
  modalExampleOverModalFirstTs: string = require('raw-loader!./modal-in-modal/first.ts.txt');
  modalExampleOverModalFirstHtml: string = require('raw-loader!./modal-in-modal/first.html.txt');
  modalExampleOverModalSecondTs: string = require('raw-loader!./modal-in-modal/second.ts.txt');
  modalExampleOverModalSecondHtml: string = require('raw-loader!./modal-in-modal/second.html.txt');

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  showExampleModalSmall(): void {
      this.router.navigate(['modal-examples/small'], {relativeTo: this.route});
  }

  showExampleModalConfirm(): void {
    this.router.navigate(['modal-examples/confirm'], {relativeTo: this.route});
  }

  showExampleModalNotificationWarning(): void {
    this.router.navigate(['modal-examples/notification-warning'], {relativeTo: this.route});
  }

  showExampleModalLarge(): void {
    this.router.navigate(['modal-examples/large'], {relativeTo: this.route});
  }

  showExampleModalLargeDefaultHeader(): void {
    this.router.navigate(['modal-examples/large-default-header'], {relativeTo: this.route});
  }

  showExampleModalLargeBlueHeader(): void {
    this.router.navigate(['modal-examples/large-blue-header'], {relativeTo: this.route});
  }
}
