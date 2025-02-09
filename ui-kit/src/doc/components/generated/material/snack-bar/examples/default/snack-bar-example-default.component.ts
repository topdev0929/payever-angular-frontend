import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'doc-snack-bar-example-default',
  templateUrl: './snack-bar-example-default.component.html',
  styleUrls: ['./snack-bar-example-default.component.scss']
})
export class SnackBarExampleDefaultComponent {
  constructor(
  private snackBar: MatSnackBar
  ) {
  }

  show(): void {
    this.snackBar.open('London is the capital of great britain!');
  }

}
