import { PebVersion } from '@pe/builder-core';

export function getPagesFromTheme(version: PebVersion): string[] {
  const defaultRoutes: string[] = [''];
  // const pages: PageInterface[] = version && version.pages || [];
  const routes: string[] = version.routing.map(route => route.url); // pages.map((page: PageInterface) => page.data.slug);
  return [ ...defaultRoutes, ...routes].map((route: string) => normalizeRoute(route));
}

function normalizeRoute(route: string): string {
  if (route.startsWith('/')) {
    route = route.substring(1); // remove first /
  }

  if (route.endsWith('/')) {
    route = route.substring(0, route.length - 1) // remove last /
  }

  return route;
}
