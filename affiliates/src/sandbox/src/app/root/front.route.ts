import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './front.route.html',
  styleUrls: ['./front.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxFrontRouteComponent {}
