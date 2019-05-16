import { Lambdur } from "./";

export class LambdurResponse<ResponseType extends Lambdur.Handler.Response = Lambdur.Handler.Response> {
  constructor(
    public options: ResponseType,
  ) {}

  public parseResponse(reference: string): ResponseType {
    const parsedResponse: ResponseType = Object.assign({}, this.options);

    if (!parsedResponse.statusCode) {
      parsedResponse.statusCode = 200;
    }

    if (typeof parsedResponse.body !== "string") {
      parsedResponse.body = JSON.stringify({
        ...parsedResponse.body,
        ref: reference,
      });
    }

    return parsedResponse;
  }
}
