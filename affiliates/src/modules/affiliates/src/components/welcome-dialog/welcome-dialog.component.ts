import {
  EventEmitter,
  Component,
  HostListener,  
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'peb-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebWelcomeDialogComponent {
  @Output()
  getStartChanged: EventEmitter<void> = new EventEmitter();
  @Output()
  backDashboardChanged: EventEmitter<void> = new EventEmitter();
  @Input() icon = 'icon-alert-24';
  constructor(
    public dialogRef: MatDialogRef<PebWelcomeDialogComponent>,
  ) {
  }
  onGetStartClick(): void {
    localStorage.setItem('startedAffiliate', 'true');
    this.getStartChanged.emit();
    this.dialogRef.close({
      cancel: true,
    });
  }
  onBackDashboardClick(): void {
    this.backDashboardChanged.emit();
    this.dialogRef.close({
      cancel: false,
    });
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.onBackDashboardClick();
  }
}
