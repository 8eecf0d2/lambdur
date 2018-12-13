# Lambdur

Simple Lambda & Cloud Function wrapper written in Typescript.

### Usage

Install with **yarn**
```bash
yarn add lambdur
```

Import and chain your handlers
```ts
import { Lambdur } from "lambdur";
import { qakMiddleware } from "./middleware";

const fooHandler = () => ({ statusCode: 200, body: "foo" });

export const handler = Lambdur.chain(
  qakMiddleware,
  fooHandler,
);
```

### Types

Lambdur provides typings for handler `request` and `response` properties which you _should_ extend to improve your typings.

```ts
import { Lambdur } from "lambdur";

const fooHandler: Lambdur.Handler<fooHandler.Request, fooHandler.Response> = async (request, context, callback) => {

  await new Promise(r => setTimeout(() => r(), 1000));

  return {
    statusCode: 200,
    body: {
      greeting: `Hello ${request.body.name}`,
      ts: new Date().getTime(),
    },
  }
}

export const handler = Lambdur.chain(fooHandler);

export namespace fooHandler {
  export interface Request extends Lambdur.Handler.Request {
    body: {
      name: string;
    }
  }
  export interface Response extends Lambdur.Handler.Request {
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
