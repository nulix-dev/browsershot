import { test } from '@japa/runner'

import { FileUrlNotAllowed } from '../../src/exceptions/file_url_not_allowed.js'
import { HtmlIsNotAllowedToContainFile } from '../../src/exceptions/html_is_not_allowed_to_contain_file.js'
import { CouldNotTakeBrowsershot } from '../../src/exceptions/could_not_take_browsershot.js'
import { ElementNotFound } from '../../src/exceptions/element_not_found.js'
import { UnsuccessfulResponse } from '../../src/exceptions/unsuccessful_response.js'
import { Browsershot } from '../../index.js'

test.group('Exceptions', () => {
  test('it will not allow a file url', () => {
    Browsershot.url('file://test')
  }).throws(new FileUrlNotAllowed().message)

  test('it will not allow html to contain file://', () => {
    Browsershot.html('<h1><img src="file://" /></h1>')
  }).throws(new HtmlIsNotAllowedToContainFile().message)

  test('it cannot save without an extension', async ({ fs, expect }) => {
    const targetPath = await fs.createPath('testScreenshot')

    const promise = Browsershot.url('https://example.com').save(targetPath)

    await expect(promise).rejects.toThrowError(CouldNotTakeBrowsershot)
  })

  test('it throws an exception if the selector does not match any elements').run(
    async ({ fs, expect }) => {
      const targetPath = await fs.createPath('nodeScreenshot.png')

      const promise = Browsershot.url('https://example.com')
        .select('not-a-valid-selector')
        .save(targetPath)

      await expect(promise).rejects.toThrowError(ElementNotFound)
    }
  )

  test('it can handle a permissions error', async ({ expect }) => {
    const targetPath = '/cantWriteThisPdf.png'

    const promise = Browsershot.url('https://example.com').save(targetPath)

    await expect(promise).rejects.toThrow()
  })

  test('it can throw an error when response is unsuccessful', async ({ fs, expect }) => {
    const targetPath = await fs.createPath('nodeScreenshot.png')

    const promise = Browsershot.url('https://google.com/404')
      .preventUnsuccessfulResponse()
      .save(targetPath)

    await expect(promise).rejects.toThrowError(UnsuccessfulResponse)
  }).disableTimeout()
})
