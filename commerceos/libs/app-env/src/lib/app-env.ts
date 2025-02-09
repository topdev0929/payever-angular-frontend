import { AppType } from '@pe/common';

export abstract class PeAppEnv {
  abstract id: string;
  abstract business: string;
  abstract type: AppType;
  abstract host: string;
  abstract api: string;
  abstract ws: string;
  abstract builder: string;
  abstract mediaContainer: string;
}
