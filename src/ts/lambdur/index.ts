import { LambdurRequest } from "./request";
import { LambdurError } from "./error";

export class Lambdur {
  public static Error = LambdurError;

  public static stringify (handler: Lambdur.Handler): Lambdur.Handler {
    return async (request, context) => {
      const response = await handler(request, context, null) as Lambdur.Handler.Response;
      return {
        ...response,
        body: JSON.stringify(response.body),
      };
    }
  }

  public static chain (...handlers: Lambdur.Handler[]): Lambdur.Handler {
    return async (request, context) => {
      const lambdaRequest = new LambdurRequest(request);

      let response: Lambdur.Handler.Response;


      const parsedRequest = lambdaRequest.parseRequest();
      for (const handler of handlers) {
        try {
          response = <Lambdur.Handler.Response>await handler(parsedRequest, context, response);
        } catch (error) {
          if(error.lambdurError === true) {
            response = {
              statusCode: error.options.statusCode,
              body: JSON.stringify({
                error: {
                  id: error.options.id,
                  message: error.options.message,
                },
                ref: lambdaRequest.reference,
              }),
            }
          } else {
            response = {
              statusCode: 500,
            };
            if(process.env.NODE_ENV === "development") {
              response.body = JSON.stringify({
                error: {
                  id: "0",
                  message: error.message,
                  details: error
                },
                ref: lambdaRequest.reference,
              });
            } else {
              response.body = JSON.stringify({
                error: {
                  id: "0",
                  message: "Internal error occurred.",
                },
                ref: lambdaRequest.reference,
              });
            }
          }

          return response;
        }
      }

      if(typeof response.body === "string") {
        response.body = {
          message: response.body,
        }
      }

      if(response.body) {
        response.body = JSON.stringify({ ...response.body, ref: lambdaRequest.reference });
      }

      if(!response.statusCode) {
        response.statusCode = 200;
      }

      return response;
    }
  }
}

export namespace Lambdur {
  export namespace Handler {
    export interface Request {
      ref: string;
      body: any;
      query: {
        [key: string]: any;
      };
      method: string;
      headers: {
        [key: string]: string;
      };
    }
    export interface Context {}
    export interface Response {
      statusCode: number;
      body?: any;
    }
    export type Callback<ResponseType> = (error: boolean, response: ResponseType) => void;
  }
  export type Handler<
    RequestType = Lambdur.Handler.Request,
    ResponseType = Lambdur.Handler.Response,
    ContextType = Lambdur.Handler.Context,
  > = (
    request: RequestType,
    context: ContextType,
    response: ResponseType,
  ) => Promise<ResponseType|void>;
}
