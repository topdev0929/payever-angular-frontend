import { PebMigration } from '../migrations.interface';


export const removeMotionBasketFill: PebMigration = async (elm: any, page) => {
  if (elm['motion'] && elm['motion'].action.eventType === 'basket-fill') {
    delete elm['motion'];

    elm.contextSchema = { uniqueTag: 'checkout.cart.counter' };
  }

  return elm;
};
