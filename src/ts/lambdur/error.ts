import { Lambdur } from "./";

export class LambdurError {
  public lambdurError = true;

  constructor(
    public options: Error.Options
  ) {}
}

export namespace Error {
  export interface Options {
    id: string;
    message: string;
    statusCode: number;
  }
}
