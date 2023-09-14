if (!globalThis['XMLHttpRequest']) {
  type Callback = Function;

  class ProgressEvent {}

  class XMLHttpRequest {
    public withCredentials: boolean = undefined;

    // request info
    private _events: {[name: string]: Callback} = {};
    private _headers: {[name: string]: string} = {};
    private _method: string;
    private _url: string;

    // response info
    public headers: {[name: string]: string};
    public statusText: string;
    public status: number;
    public response: any;

    constructor() {}

    set ontimeout(cb: Callback) { this._events['timeout'] = cb; }
    get ontimeout() { return this._events['timeout']; }

    set onloadstart(cb: Callback) { this._events['loadstart'] = cb; }
    get onloadstart() { return this._events['loadstart']; }

    set onloadend(cb: Callback) { this._events['loadend'] = cb; }
    get onloadend() { return this._events['loadend']; }

    set onload(cb: Callback) { this._events['load'] = cb; }
    get onload() { return this._events['load']; }

    set onerror(cb: Callback) { this._events['error'] = cb; }
    get onerror() { return this._events['error']; }

    addEventListener(event: string, callback: Callback) {
      this._events[event] = callback;
    }

    setRequestHeader(name: string, value: string) {
      this._headers[name] = value;
    }

    getAllResponseHeaders() {
      return this.headers;
    }

    open(method: string, url: string) {
      this._method = method;
      this._url = url;
    }

    send(body?: string) {
      const options: RequestInit = {
        method: this._method,
        headers: this._headers,
        body,
      };

      if (this.withCredentials) {
        options.credentials = "include";
      }

      // err.timeout = err.type == 'timeout';

      // dummy ProgressEvent
      const e = new ProgressEvent();
      this._events['loadstart']?.(e);

      fetch(this._url, options).then((response) => {
        // fill response headers
        this.headers = {};
        response.headers.forEach((value, key) =>
          this.headers[key] = value);

        // trigger events
        this._events['onload']?.(e);
        this._events['loadend']?.(e);

      }).catch((reason) => {
        this._events['onerror']?.(reason);
      });
    }

  }

  // @ts-ignore
  globalThis['XMLHttpRequest'] = XMLHttpRequest;
}
