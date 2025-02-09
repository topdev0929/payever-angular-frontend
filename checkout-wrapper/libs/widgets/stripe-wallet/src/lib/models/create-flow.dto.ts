import { FlowInterface } from '@pe/checkout/types';

export interface CreateFlowRequestDto {
  channelSetId: string;
  noticeUrl: string;
  cancelUrl: string;
  failureUrl: string;
  pendingUrl: string;
  successUrl: string;
  customerRedirectUrl?: string;

  reference?: string;
  amount?: number;
}

export type CreateFlowResponseDto = FlowInterface;
