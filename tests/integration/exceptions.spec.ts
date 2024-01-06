import { test } from '@japa/runner'

import { FileUrlNotAllowed } from '../../src/exceptions/file_url_not_allowed'
import { HtmlIsNotAllowedToContainFile } from '../../src/exceptions/html_is_not_allowed_to_contain_file'
import { CouldNotTakeBrowsershot } from '../../src/exceptions/could_not_take_browsershot'
import { ElementNotFound } from '../../src/exceptions/element_not_found'
import { UnsuccessfulResponse } from '../../src/exceptions/unsuccessful_response'
import { Browsershot } from '../../index'

test.group('Exceptions', () => {
  test('it will not allow a file url', ({ assert }) => {
    assert.plan(1)

    try {
      Browsershot.url('file://test')
    } catch (error) {
      assert.instanceOf(error, FileUrlNotAllowed)
    }
  })

  test('it will not allow html to contain file://', ({ assert }) => {
    assert.plan(1)

    try {
      Browsershot.html('<h1><img src="file://" /></h1>')
    } catch (error) {
      assert.instanceOf(error, HtmlIsNotAllowedToContainFile)
    }
  })

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
  }).skip(true, 'Does not throws an exception on windows - TODO')

  test('it can throw an error when response is unsuccessful', async ({ fs, expect }) => {
    const targetPath = await fs.createPath('nodeScreenshot.png')

    const promise = Browsershot.url('https://google.com/404')
      .preventUnsuccessfulResponse()
      .save(targetPath)

    await expect(promise).rejects.toThrowError(UnsuccessfulResponse)
  }).disableTimeout()
})
