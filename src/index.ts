if (!globalThis['XMLHttpRequest']) {
  type Callback = Function;

  class ProgressEvent {}

  class XMLHttpRequest {
    public withCredentials?: boolean = undefined;

    // request info
    public timeout: number = 0;
    private _events: {[name: string]: Callback} = {};
    private _headers: {[name: string]: string} = {};
    private _method: string;
    private _url: string;

    // response info
    public headers: {[name: string]: string};
    public statusText: string;
    public status: number;
    public response: any;
    private allHeaders: string;

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
      return this.allHeaders;
    }

    open(method: string, url: string) {
      this._method = method;
      this._url = url;
    }

    send(body?: string) {
      // const controller = new AbortController();

      const options: RequestInit = {
        method: this._method,
        headers: this._headers,
        body,
        // signal: controller.signal,
      };

      if (this.withCredentials) {
        options.credentials = "include";
      }

      // dummy ProgressEvent
      const e = new ProgressEvent();
      this._events['loadstart']?.(e);

      // let timeoutId: number;
      // if (this.timeout > 0) {
      //   timeoutId = setTimeout(() => controller.abort(), this.timeout);
      // }

      fetch(this._url, options).then(async (response) => {
        // clearTimeout(timeoutId);

        // fill response headers
        this.allHeaders = "";
        this.headers = {};
        for (const [key, value] of response.headers.entries()) {
          this.headers[key] = value;
          this.allHeaders += key + ": " + value + "\r\n";
        }

        this.status = response.status;
        this.statusText = response.statusText;
        this.response = await response.text();

        // trigger events
        this._events['load']?.(e);
        this._events['loadend']?.(e);

      }).catch((reason) => {
        // clearTimeout(timeoutId);
        console.error(reason.message);

        if (reason.code && (reason.code == 20 || reason.code == 23)) {
          reason.type = 'timeout';
        }

        this._events['error']?.(reason);
      });
    }

  }

  // @ts-ignore
  globalThis['XMLHttpRequest'] = XMLHttpRequest;
}
