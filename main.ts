import { Hono } from '@hono/hono'
import { HTTPException } from '@hono/hono/http-exception'
import crxToZip from 'https://raw.githubusercontent.com/nakasyou/FireCws/main/src/lib/crx-to-zip/index.js'

export const downloadFromWebStore = async (
  extensionId: string
): Promise<Uint8Array> => {
  const url = `https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromecrx&prodchannel=&prodversion=114.0.5735.248&lang=ja&acceptformat=crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

const app = new Hono()

app.get('/', c => {
  return c.html(`<!doctype HTML><html>
    <head>
      <meta charset="UFT-8" />
    </head>
    <body>
      <h1>WebStore downloader</h1>
      <form action="/dl">
        <label>
          Chrome Web Store ID:
          <input type="text" name="id" />
        </label>
        <input type="submit" value="Download" />
      </form>
    </body>
  </html>`)
})

app.get('/dl', async c => {
  const id = c.req.query('id')
  if (!id) {
    throw new HTTPException(400)
  }
  const crx = await downloadFromWebStore(id)
  c.header('content-type', 'application/zip')
  return c.body(crxToZip(crx))
})

Deno.serve(app.fetch)
