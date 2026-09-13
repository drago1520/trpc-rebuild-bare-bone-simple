import index from './index.html'
import { fetchAdapter, type FuncsNested } from '../trpc.ts'

// Router. Just an object with functions.
const app = {
  greet: (name: string) => `hello ${name}`,
} satisfies FuncsNested

export type App = typeof app

const server = Bun.serve({
  routes: {
    '/': index,            // Bun bundles client-side.ts for the browser
    '/trpc/*': fetchAdapter(app),
  },
})
console.log('open', server.url.href)
