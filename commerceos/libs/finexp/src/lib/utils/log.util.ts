const logsEnabled = Boolean(localStorage.getItem('payEverLogsEnabled'));

export function log(msg: string, ...optionalParams: any[]): void {
  const host = window.location.hostname;
  if (logsEnabled || host === 'localhost' || host.indexOf('.test.') >= 0 || host.indexOf('.test.')) {
    console.log('FINEXP WIDGET:', msg, ...optionalParams);
  }
}
