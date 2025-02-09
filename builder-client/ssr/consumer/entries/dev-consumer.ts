import { baseConsumer } from '../base-consumer';
const devData = require('../test-events.json');

const dotenv = require('dotenv');
const args = require('yargs').argv;
const isDev: boolean = args.dev;
if (isDev) {
  dotenv.config();
}

(() => {
  console.log('DEV CONSUMER STARTED');

  const { routingKey, data } = devData.AppPublishedEvent_Yura_3;

  const ackCallback = () => {
    console.log('ACK');
  };

  baseConsumer(routingKey, data, ackCallback, isDev);
})();
