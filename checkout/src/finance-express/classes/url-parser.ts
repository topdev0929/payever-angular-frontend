/**
 * Custom url parser. Used for compability with all browsers
 */
export class UrlParser {

  options: any = {
    strictMode: false,
    key: [
      'source', 'protocol', 'authority', 'userInfo', 'user', 'password',
      'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ],
    q:   {
      name:   'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      // tslint:disable-next-line max-line-length
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      // tslint:disable-next-line max-line-length
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  uri: any = {};

  constructor(str: string) {
    const	o = this.options;
    const m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str);
    let i = 14;

    while (i--) { this.uri[o.key[i]] = m[i] || ''; }

    this.uri[o.q.name] = {};
    this.uri[o.key[12]].replace(o.q.parser, ($0, $1, $2) => {
      if ($1) { this.uri[o.q.name][$1] = $2; }
    });
  }

}
