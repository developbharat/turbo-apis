# Turbo

Framework for rapid and consistent API development

## Get started

Inside your `src/index.ts` file put the following code:

```ts
import { BuildTurbo } from "@developbharat/turbo";

const main = async (): Promise<void> => {
  const app = BuildTurbo();

  // add global middleware if needed
  app.middleware((req, res, context) => {
    // fetch current user from db
    const user = { id: 1, name: "John", isActive: true };
    if (!user) throw new TurboException("You must be logged in to access this resource.");
    context.setExtras("user", user);
  });

  // scan for routes in src directory
  app.scanRoutes("src");

  /**
   * You can use any 1 of below variants to start server.
   */
  // start server or you can start on custom port
  // defaults to port 4000, host = localhost
  app.listen();

  // on port 3000
  app.listen(3000);

  // listen on all interfaces with port 3000
  app.listen(3000, "0.0.0.0");

  // with callback
  app.listen(4000, "0.0.0.0", () => {
    console.log(`server started. we can connect with db now`);
  });

  // with max 500 concurrent tcp connections
  app.listen(4000, "0.0.0.0", () => {}, 512);
};

main().catch(console.error);
```

Now you can declare your route in `src/routes/CreateAccountRoute.ts` file

```ts
import { TurboException, BuildRoute } from "@developbharat/turbo";
import type { TurboRequest, TurboResponse, TurboContext } from "@developbharat/turbo";

export const CreateAccountRoute = BuildRoute({
  method: "GET",
  pattern: "/",
  middlewares: [
    (req: TurboRequest, _res: TurboResponse, _context: TurboContext) => {
      if (!req.headers["authorization"]) throw new TurboException(400, "Request must be authenticated.");
    },
  ],
  handle: async (_req, res: TurboResponse, context: TurboContext) => {
    const cached = await res.cache({ ttl: 30_000, name: "CreateAccountScore" }, () => ({
      name: "Johnson",
      student: true,
      marks: 200,
      totalMarks: 210,
    }));
    context.setExtras("status", "Account created successfully.");
    return res.json(cached);
  },
});
```

## Features

- [x] Create Turbo Server
- [x] Automated scanning of Routes
- [x] Custom Error and Success Responses
- [x] Custom Cache mechanism support
- [x] Global Middlewares
- [x] Request Context to set custom parameters on current request.
- [x] Typebox Schema validation
- [x] Publish on NPM
- [ ] Add documentation
- [ ] Add typescript intellisense in Route
