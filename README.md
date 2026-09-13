# Why re-invent trpc?
Do you want to learn the "magic" core behind tRPC in ~50 lines of code? - Well, I wanted. 
It all circles around the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Everything else besides this core is kinda straightforward for a normal dev.

### Ultra bare bone
With just ~50 lines I implemented the core of trpc for GET procedures that can have an input. No mutations as they're straightforward when you see how I use the Proxy API. Mutations would only add noise to the code. No extra deps.

Features:
- define routers with procedures
- procedures with or without input.
- bare bone bun http server with simple boilerplate html page showcasing the procedures.

### Disclaimer
I have no official connection to tRPC founder. The code is provided as is.