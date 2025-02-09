import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { BuilderThemeComponent } from '../../../root/theme.component';

@Component({
  selector: 'pe-builder-viewer-toggle',
  templateUrl: 'viewer-toggle.component.html',
})
export class ViewerToggleComponent extends AbstractComponent {
  constructor(private themeCmp: BuilderThemeComponent, private router: Router) {
    super();
  }

  onPreviewRequest(): void {
    this.router.navigate(['../viewer'], {
      relativeTo: this.themeCmp.route,
    }).then().catch();
  }
}
