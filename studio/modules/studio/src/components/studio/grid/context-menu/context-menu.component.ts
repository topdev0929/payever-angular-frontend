import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit } from '@angular/core';
import { CONTEXT_DATA } from './context.common';

// import { CONTEXT_DATA } from '../shapes.common';

@Component({
  selector: 'pe-studio-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeContextMenuComponent implements OnInit {

  @Input() options: Array<{
    title: string,
    onClick: () => void,
  }>;
  readonly onClose = new EventEmitter();

  theme: string;
  constructor(
    @Inject(CONTEXT_DATA) public data: any,
  ) {
    this.theme = data.theme;
    this.options = data.options ?? [];
  }

  ngOnInit(): void {
  }

}
