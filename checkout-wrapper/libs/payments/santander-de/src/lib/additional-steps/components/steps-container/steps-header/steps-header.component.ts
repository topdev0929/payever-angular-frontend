import { Component, Input } from '@angular/core';

@Component({
  selector: 'steps-header',
  templateUrl: './steps-header.component.html',
  styleUrls: ['./steps-header.component.scss'],
})
export class StepsHeaderComponent {
  @Input() steps: { label: string }[] = [];
  @Input() selectedIndex = 0;
}
