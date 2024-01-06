import { test } from '@japa/runner'

import { Browsershot } from '../../index'

test.group('PDF', () => {
  test('it can save a pdf by using the pdf extension', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('test.pdf')

    await Browsershot.url('https://example.com').save(targetPath)

    assert.fileExists('test.pdf')
    assert.mimeType(targetPath, 'application/pdf')
  })

  test('it can save a highly customized pdf', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('test.pdf')

    await Browsershot.url('https://example.com')
      .hideBrowserHeaderAndFooter()
      .showBackground()
      .landscape()
      .margins(5, 25, 5, 25)
      .pages('1')
      .savePdf(targetPath)

    assert.fileExists('test.pdf')
    assert.mimeType(targetPath, 'application/pdf')
  })

  test('it can save a highly customized pdf when using pipe', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('test.pdf')

    await Browsershot.url('https://example.com')
      .hideBrowserHeaderAndFooter()
      .showBackground()
      .landscape()
      .margins(5, 25, 5, 25)
      .pages('1')
      .usePipe()
      .savePdf(targetPath)

    assert.fileExists('test.pdf')
    assert.mimeType(targetPath, 'application/pdf')
  })

  test('it can save a pdf with the taggedPdf option', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('test.pdf')

    await Browsershot.url('https://example.com').taggedPdf().pages('1').savePdf(targetPath)

    assert.fileExists('test.pdf')
    assert.mimeType(targetPath, 'application/pdf')
  })

  test('it can return a pdf as base 64', async ({ expect }) => {
    const base64 = await Browsershot.url('https://example.com').base64pdf()

    expect(typeof base64 === 'string').toBeTruthy()
  })
})
