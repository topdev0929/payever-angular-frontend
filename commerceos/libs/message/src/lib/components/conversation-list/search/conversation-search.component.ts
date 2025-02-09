import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';

@Component({
  selector: 'pe-message-conversation-search',
  templateUrl: './conversation-search.component.html',
  styleUrls: ['./conversation-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConversationSearchComponent {
  @Input() mobileView: boolean;
  @Input() isLiveChat: boolean;
  @Input() isLoading = false

  @Output() filter = new EventEmitter<string>();

  private searchLabel = 'search';
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly searchFilter = new FormGroup({
    filter: new FormControl(),
  });


  get messageSearchBarLabel(): string {
    const key = `message-app.sidebar.search`;

    return this.translateService.translate(key) || this.searchLabel;
  }

  constructor(private translateService: TranslateService) {
  }

  public readonly setFilter$ = this.searchFilter.controls.filter.valueChanges
    .pipe(
      tap((filter: string) => {
        this.filter.emit(filter);
      }));

  public resetFilter(): void {
    this.searchFilter.controls.filter.patchValue('');
  }

}
