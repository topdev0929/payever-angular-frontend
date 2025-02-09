export const EMAIL_VALIDATOR: (value: string) => boolean = function(value: string): boolean {
  const emailRegexp: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
  return value && value.length > 0 && emailRegexp.test(value);
}
