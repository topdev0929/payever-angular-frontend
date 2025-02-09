import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  get hash(): string {
    return window.location.hash;
  }

  set hash(hash: string) {
    window.location.hash = hash;
  }

  get host(): string {
    return window.location.host;
  }

  set host(host: string) {
    window.location.host = host;
  }

  get hostname(): string {
    return window.location.hostname;
  }

  set hostname(hostname: string) {
    window.location.hostname = hostname;
  }

  get href(): string {
    return window.location.href;
  }

  set href(href: string) {
    window.location.href = href;
  }

  get origin(): string {
    return window.location.origin;
  }

  get pathname(): string {
    return window.location.pathname;
  }

  set pathname(pathname: string) {
    window.location.pathname = pathname;
  }

  get port(): string {
    return window.location.port;
  }

  set port(port: string) {
    window.location.port = port;
  }

  get protocol(): string {
    return window.location.protocol;
  }

  set protocol(protocol: string) {
    window.location.protocol = protocol;
  }

  get search(): string {
    return window.location.search;
  }

  set search(search: string) {
    window.location.search = search;
  }

  assign(url: string): void {
    window.location.assign(url);
  }

  reload(): void {
    window.location.reload();
  }

  replace(url: string): void {
    window.location.replace(url);
  }

  toString(): string {
    return window.location.toString();
  }
}
