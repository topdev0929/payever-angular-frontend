export class FinExpRequest {
  xhr: XMLHttpRequest;

  private onLoadHandler: (data: any) => any;
  private onErrorHandler: (data?: any) => any;

  constructor(onLoadHandler: (data: any) => void, onErrorHandler: (data: any) => void = () => {}) {
    this.onLoadHandler = onLoadHandler;
    this.onErrorHandler = onErrorHandler;
    this.xhr = new XMLHttpRequest();
    this.xhr.onerror = onErrorHandler;
    this.xhr.addEventListener('load', () => this.load()); //  this.load.bind(this)

    // if (window.XDomainRequest) {
    //   this.xhr = new XDomainRequest();
    //   this.xhr.onload = this.load.bind(this);
    // } else {
    //   this.xhr = new XMLHttpRequest();
    //   this.xhr.addEventListener('load', this.load.bind(this));
    // }
  }

  open(url: string, params: {[key: string]: string} = null): void {
    if (params) {
      const paramsArray: string[] = [];
      for (let key in params) {
        const value = params[key];
        paramsArray.push(`${key}=${value}`);
      }
      if (paramsArray.length > 0) {
        url = `${url}?${paramsArray.join('&')}`;
      }
    }
    this.xhr.open('GET', url);
    this.xhr.responseType = 'json';
    try {
      this.xhr.send();
    } catch (error) {
      this.onErrorHandler(error);
    }


    // if (!window.XDomainRequest) {
    //   try {
    //     this.xhr.responseType = 'json';
    //   } catch (error) {}
    // }
  }

  post(url: string, body: any): void {
    this.xhr.open('POST', url);
    this.xhr.responseType = 'json';
    this.xhr.setRequestHeader('Content-Type', 'application/json');
    this.xhr.withCredentials = true;
    try {
      this.xhr.send(JSON.stringify(body));
    } catch (error) {
      this.onErrorHandler(error);
    }
  }

  load(): void {
    if (this.xhr.status === 200) {
      const supportsJSON = 'response' in this.xhr && (this.xhr.responseType === 'json');
      return this.onLoadHandler(supportsJSON ? this.xhr.response : JSON.parse(this.xhr.responseText));
    } else if (this.xhr.status >= 400) {
      this.onErrorHandler();
    }

    // if (window.XDomainRequest) {
    //   return this.onload(JSON.parse(this.xhr.responseText));
    // } else {
    //   if (this.xhr.status === 200) {
    //     const supportsJSON = 'response' in this.xhr && (this.xhr.responseType === 'json');
    //     return this.onload(supportsJSON ? this.xhr.response : JSON.parse(this.xhr.responseText));
    //   }
    // }
  }
}
