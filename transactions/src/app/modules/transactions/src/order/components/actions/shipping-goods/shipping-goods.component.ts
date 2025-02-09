import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { some } from 'lodash-es';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionRequestInterface, DetailInterface, ActionType, SettingsService, ShippingLabelInterface, ApiService, ActionInterface } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-shipping-goods',
  templateUrl: 'shipping-goods.component.html',
  styleUrls: ['./shipping-goods.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionShippingGoodsComponent implements OnDestroy, OnInit {

  error: string = null;
  loading: boolean = false;

  modalButtons: any[] = [];

  form: FormGroup = null;
  isReady: boolean = false;

  close$: Subject<void> = new Subject<void>();

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;

  private order: DetailInterface = null;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private shippingLabelData: ShippingLabelInterface = null;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.getData();
  }

  onSubmit(): void {
    this.loading = true;
    const data: ActionRequestInterface = {};
    if (this.form.get('amount') && this.form.get('amount').value) {
      data.amount = this.form.get('amount').value;
    }
    this.error = null;
    this.detailService.actionOrder(this.orderId, data, 'shipping_goods', 'payment_shipping_goods', true, this.order.payment_option.type).subscribe(
      () => this.close$.next(),
      err => {
        // this.error = err.error && err.error.message ? err.error.message : err.message;
        this.error = this.translateService.translate('form.shipping_goods.errors.unknown');
        this.loading = false;
      }
    );
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface) => {
        this.order = order;
        this.createForm();

        this.addActions();
        this.isReady = true;
        this.changeDetectorRef.detectChanges();

        /*
        if (this.order.transaction.example && this.order.shipping && this.order.shipping.example_label) {
          this.modalButtons = [{
            title: this.translateService.translate(this.translateService.translate('form.shipping_goods.actions.download_label')),
            onClick: () => {
              const url: string = this.settingsService.apiMicroBaseUrl + this.order.shipping.example_label;
              const win = window.open(url, '_blank');
              if (win) win.focus();
              this.close$.next();
            }
          }];
        }*/
      }
    );
  }

  private addActions(): void {
    const addLabelAction: ActionInterface = (this.order._shippingActions || []).find(a => a.action === 'download_shipping_label' && a.enabled);
    const addSlipAction: ActionInterface = (this.order._shippingActions || []).find(a => a.action === 'download_shipping_slip' && a.enabled);

    if (addLabelAction) {
      this.apiService.downloadLabel(this.order.business.uuid, this.order.shipping.order_id).subscribe((res: ShippingLabelInterface) => {
        this.shippingLabelData = res;
      }, err => {
        this.error = err.message || 'Can\'t get shipping label data';
      });
      this.modalButtons.push({
        title: this.translateService.translate(this.translateService.translate('form.shipping_goods.actions.download_label')),
        onClick: () => {
          if (this.shippingLabelData) {
            window.open(this.shippingLabelData.label, '__blank');
          }
        }
      });
    }

    if (addSlipAction) {
      this.modalButtons.push({
        title: this.translateService.translate(this.translateService.translate('form.shipping_goods.actions.download_shipping_slip')),
        onClick: () => {
          this.router.navigate(['../../', 'action', this.orderId, 'download_shipping_slip'], {
            relativeTo: this.activatedRoute
          });
        }
      });
    }

    // TODO Not sure about this one
    this.modalButtons.push({
      title: this.translateService.translate('form.shipping_goods.actions.send'),
      onClick: () => this.onSubmit()
    });
  }

  private createForm(): void {
    const controlsConfig: { [propName: string]: string } = {};
    this.form = this.formBuilder.group(controlsConfig);
  }

}
