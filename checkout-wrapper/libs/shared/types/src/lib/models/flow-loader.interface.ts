import { FlowInterface } from './flow.interface';

export interface FlowLoader {
  flowData: FlowInterface;
  lastError: string;
  successCallback: (data: FlowInterface) => void;
  errorCallback: (error: any) => void;
}
