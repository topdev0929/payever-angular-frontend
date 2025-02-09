import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { CurrencyPipe, TranslateService } from '@pe/i18n';

import { ActionTypeEnum, DetailInterface, OrderHistoryStatusEnum, TimelineInterface } from '../../shared';
import { DetailsState } from '../store';

@Injectable()
export class TimelineService {
  @SelectSnapshot(DetailsState.itemsArray) private itemsArray;

  constructor(
    private translateService: TranslateService,
    private currency: CurrencyPipe,
  ) {}

  public prepareTimeline(order: DetailInterface, locale: string): TimelineInterface[] {
    const timelineItems = [];
    const translationsScope = 'transactions.sections.timeline';

    order.history.forEach((item) => {
      const by = this.translateService.translate(`${translationsScope}.by`);
      const reason = this.translateService.translate(`${translationsScope}.reason`);
      const byUser = item?.user ? `${by} ${item?.user?.email}` : '';
      let status: OrderHistoryStatusEnum = undefined;
      if (item.status === 'success') {
        status = OrderHistoryStatusEnum.SUCCESS;
      } else if (['fail', 'failed'].includes(item.status)) {
        status = OrderHistoryStatusEnum.FAILED;
      }
      const timeLine: TimelineInterface = {
        date: item.created_at,
        status,
        text: this.translateService.translate(`${translationsScope}.action.` + item.action, { byUser }),
      };

      switch (item.action) {
        case ActionTypeEnum.ChangeAmount:
        case ActionTypeEnum.Change_Amount:
        case ActionTypeEnum.ShippingGoods:
          timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action, {
            amount: this.currency.transform(item.amount, order.transaction.currency, undefined, undefined, locale),
            byUser,
          });
          break;
        case ActionTypeEnum.EditReference:
          timeLine.text = this.translateService.translate(`${translationsScope}.action.change_reference`, {
            reference: item.reference,
            byUser,
          });
          break;
        case ActionTypeEnum.StatusChanged:
        case ActionTypeEnum.StatusChangedOld:
          timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action, {
            payment_status: this.translateService.translate(`${translationsScope}.statuses.general.` + item.payment_status),
            byUser,
          });
          break;
        case ActionTypeEnum.PSPStatusChanged:
            timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action, {
              pspStatus: this.translateService.hasTranslation(`${translationsScope}.statuses.psp.` + item.psp_status)
                ? this.translateService.translate(`${translationsScope}.statuses.psp.` + item.psp_status)
                : item.psp_status,
              requirementsState: this.translateService.hasTranslation(`${translationsScope}.requirements.${item.requirements_state}`)
                ? this.translateService.translate(`${translationsScope}.requirements.${item.requirements_state}`)
                : '',
            });
            break;
        case ActionTypeEnum.Refund:
          item.refund_items?.forEach((refundItem) => {
            timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action + '.items', {
              count: refundItem.quantity,
              item: this.itemsArray[refundItem.identifier].name,
              reason: item.reason ? `. ${reason}: ${item.reason}` : '',
              byUser,
            });

            timelineItems.push(timeLine);
          });
          if (!item.refund_items?.length) {
            timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action + '.amount', {
              amount: this.currency.transform(item.amount, order.transaction.currency, undefined, undefined, locale),
              reason: item.reason ? `. ${reason}: ${item.reason}` : '',
              byUser,
            });

            timelineItems.push(timeLine);
          }
          break;
        case ActionTypeEnum.Capture:
          timeLine.text = item.amount ?
          this.translateService.translate(`${translationsScope}.action.capture_with_amount`, {
            amount: this.currency.transform(item.amount, order.transaction.currency, undefined, undefined, locale),
            byUser,
          }) :
          this.translateService.translate(`${translationsScope}.action.capture`, { byUser });
          break;
        case ActionTypeEnum.Cancel:
          timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action, {
            amount: this.currency.transform(item.amount, order.transaction.currency, undefined, undefined, locale),
            reason: item.reason ? `. ${reason}: ${item.reason}` : '',
            byUser,
          });
          break;
        case ActionTypeEnum.Upload: {
          const category = item.request_data.fields.documents[0].documentType;
          timeLine.text = this.translateService.translate(`${translationsScope}.action.` + item.action, {
            category: this.translateService.translate(`transactions.form.upload.labels.${category}`),
            byUser,
          });
          break;
        }
      }

      item.action !== ActionTypeEnum.Refund && timelineItems.push(timeLine);
    });

    return timelineItems;
  }
}
