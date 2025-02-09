import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-message-conversation-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
})
export class PeMessageConversationEmptyListComponent {
  @Input() isLoading = true;
}
