import { Inject, Injectable } from '@angular/core';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

import { SnackBarContentComponent } from '../../components';
import { SNACK_BAR_DEFAULT_DURATION } from '../../constants';
import { SnackBarConfig, SnackBarDataInterface, SnackBarRef, SnackBarVerticalPositionType } from '../../types';

@Injectable()
export class SnackBarService {

  get isShowing(): boolean {
    return this.isShowingSubject.getValue();
  }

  private ref: SnackBarRef;
  private text: string;
  private isShowingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) private defaultConfig: MatSnackBarConfig,
    private snackBar: MatSnackBar
  ) {}

  toggle(
    isVisible: boolean,
    content: string,
    config: SnackBarConfig = {}
  ): SnackBarRef {
    if (isVisible) {
      return this.show(content, config);
    }
    if (content === this.text) {
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
      width: config.width,
    };

    const defaultDuration = this.defaultConfig.duration
          ? this.defaultConfig.duration
          : SNACK_BAR_DEFAULT_DURATION;

    const duration: number = config.duration
      ? config.duration
      : defaultDuration;

    const verticalPosition = (config.position || SnackBarVerticalPositionType.Top) as MatSnackBarVerticalPosition;

    const positionClass = `mat-snack-bar-container-place-${config.position || SnackBarVerticalPositionType.Top}`;
    const panelClass = [positionClass].concat(Array.isArray(config.panelClass)
      ? config.panelClass
      : [config.panelClass]
    );

    this.ref = this.snackBar.openFromComponent<SnackBarContentComponent>(
      SnackBarContentComponent,
      {
        data,
        duration,
        verticalPosition,
        panelClass,
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
      delete this.text;
    }
  }
}
