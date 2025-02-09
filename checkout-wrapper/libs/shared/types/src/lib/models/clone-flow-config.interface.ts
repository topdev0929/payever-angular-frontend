import { FlowCloneReason } from '../enums';

export interface CloneFlowConfig {
  flowId?: string;
  skipData: boolean;
  reason: FlowCloneReason;
  redirect: boolean;
}
