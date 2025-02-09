import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy,
  OnInit, Output, ViewChild
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'pe-data-grid-search',
  templateUrl: 'search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridSearchComponent implements OnInit, OnDestroy {

  @ViewChild('inputSearch') inputEl: ElementRef;
  @ViewChild(MatMenuTrigger, { static: true }) menuTrigger: MatMenuTrigger;

  @Input()
  set searchValue(value: string) {
    this.previewValue = value;
    this.input = this.previewValue;
  }

  @Output() inputSearch: EventEmitter<string> = new EventEmitter<string>();

  input: string = null;
  previewValue: string = null;

  private subscriptions: Subscription[] = [];

  onSearch(): void {
    if (this.input !== this.previewValue) {
      this.inputSearch.emit(this.input);
    }
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.menuTrigger.menuOpened
        // For guarantee element existence in the DOM
        .pipe(delay(0))
        .subscribe(() => {
          if (this.inputEl) {
            this.inputEl.nativeElement.focus();
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.subscriptions = null;
  }

}
