import { ProgramEntity } from '../../../api/subscription/subscription.api.interface';

import 'reflect-metadata';
import { Expose, Transform } from 'class-transformer';

// @dynamic
export class PesProgramDto {
  @Expose()
  @Transform((value, obj: ProgramEntity) => obj._id)
  id: string;

  @Expose()
  @Transform((value, obj: ProgramEntity) => obj.name)
  title: string;

  @Expose()
  @Transform((value, obj: ProgramEntity) => obj.name)
  subtitle: string;

  @Expose()
  interval: string;

  @Expose()
  @Transform((value, obj: ProgramEntity) => obj.subscribersTotal ?? 0)
  subscriptions: number;

  @Expose()
  @Transform((value, obj: ProgramEntity) => obj.business.currency)
  currency: string;

  @Expose()
  selected: boolean;
}
