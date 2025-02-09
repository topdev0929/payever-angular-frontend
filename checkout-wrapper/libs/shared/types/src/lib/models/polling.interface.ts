export class PollingError {
  constructor(
    public code: 'timeout',
    public message: string,
  ) {}
}

export interface PollingConfig {
  pollingInterval: number;
  maxTimeout?: number;
}
