import { OnInit,
         Directive,
         ComponentRef,
         ViewContainerRef,
         HostListener,
         Input,
         Output,
         EventEmitter
       } from '@angular/core';

import {Subscription} from 'rxjs';
import {assign} from 'lodash-es';

import {ConfirmationDialogComponent} from './confirmation-dialog.component';
import {ConfirmationDialogService} from './confirmation-dialog.service';
import {ConfirmationDialogConfig, confirmationDialogDefaultConfig} from './confirmation-dialog.config';

@Directive({
  selector: '[peConfirmationDialog]',
  exportAs: 'pe-confirmation-dialog'
})
export class ConfirmationDialogDirective implements OnInit {
  @Input() public config: ConfirmationDialogConfig;
  @Output() public confirm: EventEmitter<any> = new EventEmitter();
  @Output() public cancel: EventEmitter<any> = new EventEmitter();
  @Output() public hide: EventEmitter<any> = new EventEmitter();
  @Output() public show: EventEmitter<any> = new EventEmitter();

  protected cmpRef: ComponentRef<ConfirmationDialogComponent>;
  protected onHiddenSub: Subscription;
  protected actionsSub: Subscription[];

  constructor(protected service: ConfirmationDialogService,
              protected ref: ViewContainerRef) {

  }

  @HostListener('click')
  public onClick(): any {
    this.cmpRef = this.service.createConfirmationDialog(this.config, this.ref);
    this.onHiddenSub = this.cmpRef.instance.hide.subscribe(() => {
      this.unsubscribe();
    });
    this.actionsSub = ['show', 'hide', 'cancel', 'confirm'].map((action: string) => {
      const instance: any = this.cmpRef.instance;
      return instance[action].subscribe((...args: any[]) => {
        (<any>this)[action].emit(...args);
      });
    });
  }

  ngOnInit(): void {
    const config: any = {};

    assign(config, confirmationDialogDefaultConfig);

    if (this.config) {
      assign(config, this.config);
    }
    this.config = config;
  }

  unsubscribe(): void {
    this.onHiddenSub.unsubscribe();
    this.actionsSub.forEach(action => action.unsubscribe());
    this.actionsSub = [];
  }
}
