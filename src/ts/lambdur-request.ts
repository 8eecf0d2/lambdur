import { Lambdur } from "./";

export class LambdurRequest {
  public reference: string;

  constructor(
    private type: Lambdur.Handler.Type,
    private request: any,
  ) {
    this.reference = Math.random().toString(16).substring(2);
  }

  public parseRequest(): Lambdur.Handler.Request {
    switch (this.type) {
      case Lambdur.Handler.Type.HTTP:
        return this.parseHttpRequest();
      case Lambdur.Handler.Type.SQS:
        return this.parseSqsRequest();
      case Lambdur.Handler.Type.SNS:
        return this.parseSnsRequest();
      case Lambdur.Handler.Type.CRON:
        return this.parseCronRequest();
    }
  }

  public parseHttpRequest(): Lambdur.Handler.Request.HTTP {
    return {
      ...this.request,
      ref: this.reference,
      body: LambdurRequest.safeJsonParse(this.request.body),
      rawbody: this.request.body,
      headers: LambdurRequest.safeHeaderParse(this.request.headers),
      query: LambdurRequest.safeQueryParse(this.request),
    };
  }

  public parseSqsRequest(): Lambdur.Handler.Request.SQS {
    return {
      ...this.request,
      Records: this.request.Records.map((record: any) => {
        return {
          ...record,
          body: LambdurRequest.safeJsonParse(record.body),
        };
      }),
    };
  }

  public parseSnsRequest(): Lambdur.Handler.Request.SNS {
    return {
      ...this.request,
      Records: this.request.Records.map((record: any) => {
        return {
          ...record,
          body: LambdurRequest.safeJsonParse(record.body),
        };
      }),
    };
  }

  public parseCronRequest(): Lambdur.Handler.Request.SNS {
    return {
      ...this.request,
      body: LambdurRequest.safeJsonParse(this.request.body),
    };
  }

  private static safeJsonParse(json: string): any {
    let jsonParsed = {};

    try {
      jsonParsed = typeof json === "string" ? JSON.parse(json) : json;
    } catch (error) {
      jsonParsed = {};
    }

    return jsonParsed;
  }

  private static safeHeaderParse(headers: { [key: string]: string } = {}): { [key: string]: string } {
    const headerKeys = Object.keys(headers);

    return headerKeys.reduce((headersParsed, header) => {
      headersParsed[header.toLowerCase()] = headers[header];

      return headersParsed;
    }, {} as { [key: string]: string });
  }

  private static safeQueryParse(query: LambdurRequest.Query): { [key: string]: string } {
    return {
      ...query.queryStringParameters || {},
      ...query.query || {},
    };
  }
}

export namespace LambdurRequest {
  export interface Query {
    queryStringParameters?: any;
    query?: any;
  }
}
