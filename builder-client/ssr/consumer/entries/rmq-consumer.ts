import { enableProdMode } from '@angular/core';
import * as Amqp from 'amqp-ts';
import { baseConsumer } from '../base-consumer';
import { BUILDER_ROUTING_KEYS, DOMAIN_ROUTING_KEYS, SHOP_ROUTING_KEYS } from '../routing-keys';

console.log('BUILDER CLIENT CONSUMER START');

const dotenv = require('dotenv');
const args = require('yargs').argv;
const isDev: boolean = args.dev;
if (isDev) {
  dotenv.config();
}

const connection = new Amqp.Connection(process.env.RABBITMQ_URL);
console.log('BUILDER CLIENT RMQ CONNECTION');

const exchange: Amqp.Exchange = connection.declareExchange('async_events', 'direct', {  durable: true, });
console.log('BUILDER CLIENT RMQ EXCHANGE');

const queueOptions: Amqp.Queue.DeclarationOptions = {
  durable: true,
  deadLetterExchange: 'async_events_callback'
};
queueOptions['deadLetterRoutingKey'] = 'async_events_builder_client_micro';

const queue: Amqp.Queue = connection.declareQueue(
  'async_events_builder_client_micro',
  queueOptions
);
console.log('BUILDER CLIENT RMQ QUEUE CREATED');

bindQueueToRoutingKeys(exchange, queue);
console.log('BUILDER CLIENT RMQ BIND');

enableProdMode();

queue.activateConsumer(async (message: Amqp.Message) => {
  console.log('BUILDER CLIENT MESSAGE RECIEVED', message.fields['routingKey']);

  const routingKey: string = message.fields['routingKey'];
  const data: any = JSON.parse(message.getContent());

  const ackCallback = (): void => {
    message.ack;
  };

  baseConsumer(routingKey, data, ackCallback, isDev);
});

function bindQueueToRoutingKeys(exchange: Amqp.Exchange, queue: Amqp.Queue): void {
  for (const routingKey of [ ...BUILDER_ROUTING_KEYS, ...SHOP_ROUTING_KEYS, ...DOMAIN_ROUTING_KEYS ]) {
    queue.bind(exchange, routingKey);
  }
}
