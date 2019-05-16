# Lambdur

Simple Lambda & Cloud Function wrapper written in Typescript.

### Get Started

Install with **yarn**.

```bash
yarn add lambdur
```

### Usage

Import and chain your handlers.

```ts
import { Lambdur } from "lambdur";
import { ExampleMiddleware } from "./middleware";

const ExampleHttpHandler = () => ({
  statusCode: 200,
  body: "foo"
});

export const handler = Lambdur.chain(
  Lambdur.Handler.Type.HTTP,
  ExampleMiddleware,
  ExampleHttpHandler,
);
```

### Types

Lambdur provides types for specific types for AWS **CRON**, **HTTP**, **SNS** and **SQS** `request` and `response` properties.

```ts
import { Lambdur } from "lambdur";

const ExampleHttpHandler: Lambdur.Handler<ExampleHttpHandler.Request, ExampleHttpHandler.Response> = async (request, context, callback) => {

  await new Promise(r => setTimeout(() => r(), 1000));

  return {
    statusCode: 200,
    body: {
      greeting: `Hello ${request.body.name}`,
      ts: new Date().getTime(),
    },
  }
}

export const handler = Lambdur.chain(ExampleHttpHandler);

export namespace ExampleHttpHandler {
  export interface Request extends Lambdur.Handler.Request.HTTP {
    body: {
      name: string;
    }
  }
  export interface Response extends Lambdur.Handler.Response {
    body: {
      greeting: string;
      ts: number;
    }
  }
}
```

### Development

This is a pure Typescript package, no bundling necessary.

#### NPM Scripts

##### Buid script
```sh
yarn run build
```

##### Watch script
```sh
yarn run watch
```

##### Lint script
```sh
yarn run lint
```
