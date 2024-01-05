import { test } from '@japa/runner'

import { Browsershot } from '../../index.js'
import { FileDoesNotExistException } from '../../src/exceptions/file_does_not_exist.js'

test.group('HTML', () => {
  test('it can set html contents from a file', async ({ fs, expect }) => {
    const inputHtml = '<html><head></head><body><h1>Hello World</h1></body></html>'

    const filePath = await fs.createPath('test.html', inputHtml)

    const outputHtml = await Browsershot.htmlFromFilePath(filePath).usePipe().bodyHtml()

    expect(outputHtml).toEqual(inputHtml)
  })

  test('it can not set html contents from a non-existent file', async () => {
    Browsershot.htmlFromFilePath('/temp/non-existent-file.html')
  }).throws(new FileDoesNotExistException('/temp/non-existent-file.html').message)

  test('it can get the body html', async ({ expect }) => {
    const html = await Browsershot.url('https://example.com').bodyHtml()

    expect(html).toContain('<h1>Example Domain</h1>')
  })

  test('it can get the body html when using pipe', async ({ expect }) => {
    const html = await Browsershot.url('https://example.com').usePipe().bodyHtml()

    expect(html).toContain('<h1>Example Domain</h1>')
  })
})
