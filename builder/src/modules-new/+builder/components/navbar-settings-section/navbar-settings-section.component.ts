import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-builder-settings-section',
  templateUrl: 'navbar-settings-section.component.html',
  styleUrls: ['navbar-settings-section.component.scss'],
})
export class NavbarSettingsSectionComponent {
  @Input() title: string;
  @Input() appendBelow: boolean;

  opened: boolean;
}
