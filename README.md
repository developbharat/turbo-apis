# Turbo

Framework for rapid and consistent API development

## Get started

Inside your `src/index.ts` file put the following code:

```ts
import { turbo } from "@developbharat/turbo";

const main = async (): Promise<void> => {
  const app = turbo();

  // scan for routes in src directory
  app.scanRoutes("src");

  /**
   * You can use any 1 of below variants to start server.
   */
  // start server or you can start on custom port
  // defaults to port 4000, host = localhost
  // app.listen();

  // on port 3000
  // app.listen(3000);

  // listen on all interfaces with port 3000
  app.listen(3000, "0.0.0.0");

  // with callback
  app.listen(4000, "0.0.0.0", () => {
    console.log(`server started. we can connect with db now`);
  });

  // with max 500 concurrent tcp connections
  app.listen(4000, "0.0.0.0", () => {}, 512);
};

main.catch(console.error);
```

Now you can declare your route in `src/routes/CreateAccountRoute.ts` file

```ts
import { TurboException, Route } from "@developbharat/turbo";
import type { TurboRequest, TurboResponse } from "@developbharat/turbo";

export const CreateAccountRoute = Route({
  method: "GET",
  pattern: "/",
  middlewares: [
    (req: TurboRequest, _res: TurboResponse) => {
      if (!req.headers["authorization"]) throw new TurboException(400, "Request must be authenticated.");
    },
  ],
  handle: async (_req, res: TurboResponse) => {
    const cached = await res.cache({ ttl: 30_000, name: "CreateAccountScore" }, () => ({
      name: "Johnson",
      student: true,
      marks: 200,
      totalMarks: 210,
    }));
    return res.setExtras("status", "Account created successfully.").json(cached);
  },
});
```
