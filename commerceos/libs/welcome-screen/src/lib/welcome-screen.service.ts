import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { WelcomeOverlayScreenComponent } from './welcome-screen.component';

@Injectable({ providedIn: 'any' })
export class WelcomeScreenService {
  private overlayRef: OverlayRef;
  destroyed$ = new Subject<void>();
  readonly panelClass = "welcome_panel";
  readonly backdropClass = "cdk-dark-backdrop"

  constructor(private overlay: Overlay, private router: Router) {}

  destroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.overlayRef?.detach();
  }

  private removeExistingModals() {
    const existingModals = document.querySelectorAll(`.${this.panelClass}`);
    const existingBackdrops = document.querySelectorAll(`.${this.backdropClass}`);

    existingModals.forEach(modal => modal.remove());
    existingBackdrops.forEach(backdrop => backdrop.remove());
  }

  show() {
    this.destroy();

    this.removeExistingModals();

    this.overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      backdropClass: this.backdropClass,
      panelClass: this.panelClass,
    });
    const welcomeScreenPortal = new ComponentPortal(WelcomeOverlayScreenComponent);
    const welcomeScreenRef = this.overlayRef.attach(welcomeScreenPortal);
    welcomeScreenRef.instance.detachOverlay
      .pipe(
        tap(() => this.overlayRef.detach())
      ).subscribe();
  }
}
