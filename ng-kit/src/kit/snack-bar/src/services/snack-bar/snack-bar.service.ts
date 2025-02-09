import { Inject, Injectable } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBar, MatSnackBarConfig, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { isArray } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

import { SnackBarContentComponent } from '../../components';
import { SnackBarConfig, SnackBarDataInterface, SnackBarRef, SnackBarVerticalPositionType } from '../../types';
import { SNACK_BAR_DEFAULT_DURATION } from '../../constants';

@Injectable()
export class SnackBarService {

  get isShowing$(): Observable<boolean> {
    return this.isShowingSubject.asObservable();
  }

  get isShowing(): boolean {
    return this.isShowingSubject.getValue();
  }

  private ref: SnackBarRef;
  private text: string;
  private isShowingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) private defaultConfig: MatSnackBarConfig,
    private snackBar: MatSnackBar
  ) {}

  toggle(
    isVisible: boolean,
    content: string,
    config: SnackBarConfig = {} // properties with default params should be last args
  ): SnackBarRef {
    if (isVisible) {
      return this.show(content, config);
    } else if (content === this.text) {
      // We hide only if we hide same text (and another one not already shown)
      this.hide();
    }
    return null;
  }

  show(content: string, config: SnackBarConfig = {}): SnackBarRef {
    this.dismiss();

    const data: SnackBarDataInterface = {
      content,
      iconId: config.iconId,
      iconSize: config.iconSize,
      showClose: config.showClose,
      width: config.width
    };

    const duration: number = config.duration
      ? config.duration
      : (
        this.defaultConfig.duration
          ? this.defaultConfig.duration
          : SNACK_BAR_DEFAULT_DURATION
      );

    const verticalPosition: MatSnackBarVerticalPosition = (config.position || SnackBarVerticalPositionType.Top) as MatSnackBarVerticalPosition;

    const positionClass: string = `mat-snack-bar-container-place-${config.position || SnackBarVerticalPositionType.Top}`;
    const panelClass: string[] = [positionClass].concat( isArray(config.panelClass) ? config.panelClass : [config.panelClass] );

    this.ref = this.snackBar.openFromComponent<SnackBarContentComponent>(
      SnackBarContentComponent,
      {
        data,
        duration,
        verticalPosition,
        panelClass
      }
    );

    this.text = content;
    this.isShowingSubject.next(true);

    this.ref.afterDismissed()
      .subscribe(() => {
        this.isShowingSubject.next(false);
      });

    return this.ref;
  }

  hide(): void {
    this.dismiss();
  }

  private dismiss(): void {
    if (this.ref) {
      this.ref.dismiss();
      delete this.ref;
      delete this.text; // allow proper work of toggle() method
    }
  }
}
