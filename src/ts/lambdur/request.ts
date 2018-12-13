import { Lambdur } from "./";

export class LambdurRequest {
  public reference: string;

  constructor(
    private request: any,
  ) {
    this.reference = Math.random().toString(16).substring(2);
  }

  public parseRequest (): Lambdur.Handler.Request {
    return {
      ...this.request,
      ref: this.reference,
      body: this.parseBody(),
      headers: this.parseHeaders(),
      query: this.parseQuery(),
    };
  }

  private parseBody (): any {
    let parsedBody = {};

    try {
      parsedBody = typeof this.request.body === "string" ? JSON.parse(this.request.body) : this.request.body;
    } catch (error) {
      parsedBody = {};
    }

    return parsedBody;
  }

  private parseQuery (): { [key: string]: string } {
    return {
      ...this.request.queryStringParameters,
      ...this.request.query,
    }
  }

  private parseHeaders (): { [key: string]: string } {
    const headerKeys = Object.keys(this.request.headers);

    return headerKeys.reduce((headers, header) => {
      headers[header.toLowerCase()] = this.request.headers[header];

      return headers;
    }, {} as { [key: string]: string });
  }
}
