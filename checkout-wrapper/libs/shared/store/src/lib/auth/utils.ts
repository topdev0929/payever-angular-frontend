export function isExpired(token: string) {
  return JSON.parse(window.atob(token.split('.')[1]))?.exp * 1000 < Date.now();
}
