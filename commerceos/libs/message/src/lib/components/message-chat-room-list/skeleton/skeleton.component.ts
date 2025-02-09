import { ChangeDetectionStrategy, Component } from '@angular/core';
import { range } from 'lodash-es';

@Component({
  selector: 'pe-chat-list-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeChatListSkeletonComponent {

  get chats(): number {
    return range(8);
  }

}
