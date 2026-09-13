// one endpoint; any function.
type Func = (...args: any[]) => any;
// a bag of endpoints (functions), nestable.
export type FuncsNested = { [key: string]: Func | FuncsNested };

/** @description Given an object with procedures (functions), find the one with the given string path.
 *  @example // 'user.byId' -> walk down procs one key at a time, like app.user.byId
 *  @example resolveProc({user: {byId: () => 'Yo moma'}}, 'user.byId')
 *  @param procs that's the object containing the procedures, i.e. the router
 */
const resolveProc = (procs: FuncsNested, path: string) =>
  path.split(".").reduce<any>((node, key) => node?.[key], procs);

// --- server adapter: Request -> Procedure call -> Response ---
// curried function.
export const fetchAdapter = (procs: FuncsNested, prefix = "/trpc") =>
  async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname.slice(prefix.length + 1);
    const proc = resolveProc(procs, path);
    if (typeof proc !== "function")
      return Response.json({ error: `no procedure ${path}` }, { status: 404 });

    // input rides the URL as JSON: /trpc/greet?input=%22world%22
    const rawInput = url.searchParams.get("input");
    const input = rawInput == null ? undefined : JSON.parse(rawInput);
    try {
      return Response.json({ result: await proc(input) });
    } catch (err) {
      console.error(err); //handle error
      return Response.json({ error: "Procedure failed. Message redacted from browser" }, { status: 500 });
    }
  };

// one procedure.
// "extends" is NOT inheritance. It's like "instanceOf", returns boolean. I'm type checking the type.
type Procedure<P extends Func> = {
  query: (...args: Parameters<P>) => Promise<Awaited<ReturnType<P>>>;
};

//"For each key: is function? → make it callable. Else → recurse." [K in keyof T] is a loop.
export type Client<T> = {
  [K in keyof T]: T[K] extends Func ? Procedure<T[K]> : Client<T[K]>;
};

// Build Request -> Send to server.
// --- client: Proxy collects the path, .query() fires ---
export const createClient = <T extends FuncsNested>(baseUrl: string): Client<T> => {
  // every property access appends to path; 'query' ends it and sends
  const build = (path: string[]): any =>
    new Proxy(() => {}, {
      get(_target, key: string) {
        if (key !== "query") return build([...path, key]); //append

        //send
        return async (input?: unknown) => {
          const url = new URL(baseUrl + "/" + path.join("."));
          if (input !== undefined)
            url.searchParams.set("input", JSON.stringify(input));
          const res = await fetch(new Request(url));
          const json = await res.json();
          if (!res.ok) throw new Error(json.error);
          return json.result;
        };
      },
    });
  return build([]);
};
