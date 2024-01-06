import { test } from '@japa/runner'

import { Browsershot } from '../../index'
import { FileDoesNotExistException } from '../../src/exceptions/file_does_not_exist'

test.group('HTML', () => {
  test('it can set html contents from a file', async ({ fs, expect }) => {
    const inputHtml = '<html><head></head><body><h1>Hello World</h1></body></html>'

    const filePath = await fs.createPath('test.html', inputHtml)

    const outputHtml = await Browsershot.htmlFromFilePath(filePath).usePipe().bodyHtml()

    expect(outputHtml).toEqual(inputHtml)
  })

  test('it can not set html contents from a non-existent file', ({ assert }) => {
    assert.plan(1)

    try {
      Browsershot.htmlFromFilePath('/temp/non-existent-file.html')
    } catch (error) {
      assert.instanceOf(error, FileDoesNotExistException)
    }
  })

  test('it can get the body html', async ({ expect }) => {
    const html = await Browsershot.url('https://example.com').bodyHtml()

    expect(html).toContain('<h1>Example Domain</h1>')
  })

  test('it can get the body html when using pipe', async ({ expect }) => {
    const html = await Browsershot.url('https://example.com').usePipe().bodyHtml()

    expect(html).toContain('<h1>Example Domain</h1>')
  })
})
