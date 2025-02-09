import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SnackBarService, SnackBarVerticalPositionType } from '../../../../../../kit/snack-bar';

@Component({
  selector: 'doc-snack-bar-default-example',
  templateUrl: 'snack-bar-default-example.component.html'
})
export class SnackBarDefaultExampleComponent implements OnInit {

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.isShowing$.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  show(): void {
    this.snackBarService.show(
      'London is the capital of <strong>great britain</strong>!', {
        position: SnackBarVerticalPositionType.Bottom,
        iconId: 'icon-help-24',
        iconSize: 24,
        panelClass: ['some-custom-class', 'some-custom-class-2']
      }
    );
  }

  hide(): void {
    this.snackBarService.hide();
  }

  get isShowing$(): Observable<boolean> {
    return this.snackBarService.isShowing$;
  }
}
