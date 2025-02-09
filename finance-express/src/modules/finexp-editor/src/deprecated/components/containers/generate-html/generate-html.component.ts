import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'checkout-generate-html',
  templateUrl: './generate-html.component.html',
  styleUrls: ['./generate-html.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateHtmlComponent {

  @Input() generatedHtml;
  @Output() clickedGeneratedBox = new EventEmitter();

  copied$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly copiedTextDelay: number = 3000;

  onCopyClick(): void {
    this.clickedGeneratedBox.emit('copyCode');
    this.copied$.next(true);
    setTimeout(() => this.copied$.next(false), this.copiedTextDelay);
  }
}
