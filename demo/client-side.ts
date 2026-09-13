import { createClient } from '../trpc.ts'
import type { App } from './server-side.ts' // only the type. After compile, client has no idea about the server definitions, let alone the server source code.

const client = createClient<App>(location.origin + '/trpc')

//Simple input to greet
document.querySelector('#greet')!.addEventListener('click', async () => {
  const name = document.querySelector('#name') as HTMLInputElement
  const out = document.querySelector('#out')!
  out.textContent = await client.greet.query(name.value)
})
