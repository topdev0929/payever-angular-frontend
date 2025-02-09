import { Component } from '@angular/core';
import { range } from 'lodash-es';

@Component({
  selector: 'pe-folders-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})

export class PeFolderSkeletonComponent {

  get folders(): number {
    return range(3);
  }

  get containers(): number {
    return range(3);
  }

}
