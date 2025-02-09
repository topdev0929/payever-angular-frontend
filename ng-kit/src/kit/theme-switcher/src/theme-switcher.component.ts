import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pe-theme-switcher',
  templateUrl: 'theme-switcher.component.html',
  styleUrls: ['theme-switcher.component.scss']
})

export class ThemeSwitcherComponent {
  @Input() isMobileSelected: boolean = false;
  @Output() onToggled: EventEmitter<boolean> = new EventEmitter();

  toggleSwitcher() {
    this.isMobileSelected = !this.isMobileSelected;
    this.onToggled.emit(this.isMobileSelected);
  }
}
