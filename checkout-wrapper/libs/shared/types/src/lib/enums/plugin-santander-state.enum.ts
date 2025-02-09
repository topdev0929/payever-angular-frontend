export enum PluginSantanderStateEnum {
  inProcess = 'IN_PROCESS',
  failed = 'FAILED',
  accepted = 'ACCEPTED',
  declined = 'DECLINED',
  started = 'STARTED', // When we send inquiry and have not received answer yet
  error = 'ERROR', // Error during request
  signing = 'SIGNING', // If we approved and signing contract (only for DK and NO)
  timeout = 'TIMEOUT' // Didn't get answer during 5 minutes
}
