import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GuideItem, GuideItems} from '../../../shared/guide-items';

@Component({
  selector: 'guide-viewer',
  templateUrl: 'guide-viewer.component.html'
})
export class GuideViewerComponent {
  guide: GuideItem;

  constructor(private route: ActivatedRoute, public guideItems: GuideItems) {
    route.params.subscribe(p => {
      this.guide = guideItems.getItemById(p['id']);
    });
  }
}
