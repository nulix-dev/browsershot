import { test } from '@japa/runner'

import { Browsershot } from '../../index'
import { ChromiumResult } from '../../src/chromium_result'

test.group('Browsershot', () => {
  test('it can get the requests list', async ({ expect, assert }) => {
    const instance = Browsershot.url('https://example.com')

    const list = await instance.triggeredRequests()

    expect(list).toHaveLength(1)

    assert.deepEqual(list, [{ url: 'https://example.com/' }])

    const sameList = await instance.triggeredRequests()

    expect(list).toEqual(sameList)
  })

  test('it can get the redirect history', async ({ assert, expect }) => {
    const instance = Browsershot.url('http://www.spatie.be')

    const list = await instance.redirectHistory()

    const verificationList = list!.map(({ reason, status, url }) => ({ reason, status, url }))

    expect(verificationList).toHaveLength(2)

    assert.deepEqual(verificationList, [
      {
        url: 'https://www.spatie.be/',
        status: 301,
        reason: '',
      },
      {
        url: 'https://spatie.be/',
        status: 200,
        reason: '',
      },
    ])

    const sameList = await instance.redirectHistory()

    expect(list).toEqual(sameList)
  }).disableTimeout()

  test('it can take a high density screenshot', async ({ assert, fs }) => {
    const targetPath = await fs.createPath('testScreenshot.png')

    await Browsershot.url('https://example.com').deviceScaleFactor(2).save(targetPath)

    assert.fileExists('testScreenshot.png')
  })

  test('it can set another chrome executable path', async ({ fs, expect }) => {
    const targetPath = await fs.createPath('testScreenshot.pdf')

    const promise = Browsershot.html('Foo')
      .setChromePath('non-existent/bin/which/causes/an/exception')
      .save(targetPath)

    await expect(promise).rejects.toThrow()
  })

  test('it can get the output of a pdf', async ({ assert, fs }) => {
    const output = await Browsershot.url('https://example.com').pdf()

    const filePath = await fs.createPath('example.pdf', output.toString())

    assert.mimeType(filePath, 'application/pdf')
  })

  test('it can process post request', async ({ expect }) => {
    const html = await Browsershot.url('https://httpbin.org/post').post({ foo: 'bar' }).bodyHtml()

    expect(html).toContain('"foo": "bar"')
  })

  test('it can evaluate page', async ({ expect }) => {
    const result = await Browsershot.url('https://example.com').evaluate('1 + 1')

    expect(result).toEqual(2)
  })

  test('it can get the console messages', async ({ assert, expect }) => {
    const instance = Browsershot.url('https://bitsofco.de/styling-broken-images/')

    const consoleMessages = await instance.consoleMessages()

    assert.properties(consoleMessages![0], ['type', 'message', 'location', 'stackTrace'])

    const sameConsoleMessages = await instance.consoleMessages()

    expect(consoleMessages).toEqual(sameConsoleMessages)
  }).disableTimeout()

  test('it can get the failed requests', async ({ expect }) => {
    const instance = Browsershot.url('https://bitsofco.de/styling-broken-images/')

    const failedRequests = await instance.failedRequests()

    const firstFailedRequest = failedRequests![0]

    expect(firstFailedRequest.status).toBe(404)
    expect(firstFailedRequest.url).toBe('https://bitsofco.de/broken.jpg')

    const sameFailedRequests = await instance.failedRequests()

    expect(failedRequests).toEqual(sameFailedRequests)
  })

  test('it can get the body html and full output data', async ({ expect }) => {
    const instance = Browsershot.url('https://example.com')

    const expectedContent = '<h1>Example Domain</h1>'

    const html = await instance.bodyHtml()

    expect(html).toContain(expectedContent)

    const output = instance.output

    expect(output).toBeDefined()

    expect(output).toBeInstanceOf(ChromiumResult)

    expect(output?.getResult()).toContain(expectedContent)

    expect(output?.getException()).toBeUndefined()
    expect(output?.getConsoleMessages()).toHaveLength(0)
    expect(output?.getFailedRequests()).toHaveLength(0)
    expect(output?.getPageErrors()).toHaveLength(0)
    expect(output?.getRequestsList()).toEqual([{ url: 'https://example.com/' }])
  })

  test('it should be able to fetch page errors with pageErrors method').run(
    async ({ assert, expect }) => {
      const instance = Browsershot.html(
        `<!DOCTYPE html>
    <html lang="en">
      <body>
        <script type="text/javascript">
            throw "this is not right!";
        </script>
      </body>
    </html>`
      )

      const pageErrors = await instance.pageErrors()

      expect(pageErrors).toHaveLength(1)
      assert.isString(pageErrors![0].name)
      assert.isString(pageErrors![0].message)

      const samePageErrors = await instance.pageErrors()

      expect(pageErrors).toEqual(samePageErrors)
    }
  )
})
