import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

export interface CookieBarLabels {
  agreement: string;
  link: string;
}

@Component({
  selector: 'cookie-bar',
  templateUrl: 'cookie-bar.component.html',
  styleUrls: ['cookie-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieBarComponent {
  @Input() appName: string;
  @Input() labels: CookieBarLabels;

  private storageKey: string = 'cookieBarHidden';

  constructor(private localStorageService: LocalStorageService) {}

  get hidden(): boolean {
    return this.localStorageService.retrieve(this.storageKey);
  }

  public hide(): void {
    this.localStorageService.store(this.storageKey, true);
  }
}
