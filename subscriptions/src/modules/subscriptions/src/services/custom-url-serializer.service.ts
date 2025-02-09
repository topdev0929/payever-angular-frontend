import { DefaultUrlSerializer, UrlSerializer, UrlTree  } from '@angular/router';

export class CustomUrlSerializer implements UrlSerializer {
  parse(url: any): UrlTree {
    const dus = new DefaultUrlSerializer();
    return dus.parse(url);
  }

  serialize(tree: UrlTree): any {

    const dus = new DefaultUrlSerializer();
    const path = dus.serialize(tree);
    return path.replace(/%2F/gi, '/');
  }
}
