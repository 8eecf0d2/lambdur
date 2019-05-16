import { LambdurRequest } from "./lambdur-request";
import { LambdurResponse } from "./lambdur-response";

export class Lambdur {
  public static debug = false;
  public static Request = LambdurRequest;
  public static Response = LambdurResponse;

  public static chain <RequestType>(type: Lambdur.Handler.Type, ...handlers: Array<Lambdur.Handler>): Lambdur.Handler {
    return async (request, context) => {
      const lambdaRequest = new LambdurRequest(type, request);

      let response: LambdurResponse;

      const parsedRequest = lambdaRequest.parseRequest();

      for (const handler of handlers) {
        try {
          const lambdaResponse = await handler(parsedRequest, context, response instanceof LambdurResponse ? response.parseResponse(lambdaRequest.reference) : response);
          if (lambdaResponse instanceof LambdurResponse) {
            response = lambdaResponse;
          } else {
            response = new LambdurResponse(lambdaResponse);
          }
        } catch (error) {
          return Lambdur.handleError(error, lambdaRequest.reference);
        }
      }

      return Lambdur.handleSuccess(response, lambdaRequest.reference);
    };
  }

  private static handleSuccess(response: LambdurResponse, reference: string) {
    return response.parseResponse(reference);
  }

  private static handleError(error: Error | LambdurResponse, reference: string) {
    if (error instanceof LambdurResponse) {
      return error.parseResponse(reference);
    }

    if (Lambdur.debug === true) {
      return new LambdurResponse({
        statusCode: 500,
        body: JSON.stringify({
          error: {
            id: "UNCAUGHT_LAMBDUR_ERROR",
            message: error.message,
            details: error,
          },
        }),
      }).parseResponse(reference);
    }

    return new LambdurResponse({
      statusCode: 500,
      body: JSON.stringify({
        errors: [{
          id: "UNCAUGHT_LAMBDUR_ERROR",
          message: "Internal error occurred.",
        }],
      }),
    }).parseResponse(reference);
  }
}

export namespace Lambdur {
  export namespace AWS {
    export interface Record<BodyType = any> {
      body: BodyType;
    }
  }
  export namespace Handler {
    export enum Type {
      HTTP = "http",
      SQS = "sqs",
      SNS = "sns",
      CRON = "cron",
    }
    export namespace Request {
      export interface CRON<BodyType = any> {
        body: BodyType;
      }
      export interface HTTP {
        ref: string;
        body: any;
        rawbody: any;
        query: {
          [key: string]: any;
        };
        method: string;
        headers: {
          [key: string]: string;
        };
      }
      export interface SNS<RecordType extends Lambdur.AWS.Record = Lambdur.AWS.Record> {
        Records: Array<RecordType>;
      }
      export interface SQS<RecordType extends Lambdur.AWS.Record = Lambdur.AWS.Record> {
        Records: Array<RecordType>;
      }
    }
    export interface Context {}
    export type Request = Lambdur.Handler.Request.HTTP | Lambdur.Handler.Request.SQS | Lambdur.Handler.Request.SNS | Lambdur.Handler.Request.CRON;
    export interface Response {
      statusCode: number;
      body?: any;
    }
  }
  export type Handler<
    RequestType extends Lambdur.Handler.Request = Lambdur.Handler.Request,
    ResponseType extends Lambdur.Handler.Response = Lambdur.Handler.Response,
    ContextType = Lambdur.Handler.Context,
  > = (
    request: RequestType,
    context: ContextType,
    response: any,
  ) => Promise<LambdurResponse<ResponseType>|ResponseType>;
}
