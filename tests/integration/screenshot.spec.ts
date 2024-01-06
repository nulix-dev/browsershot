import { test } from '@japa/runner'

import { Browsershot } from '../../index'
import { BrowserCommand } from '../../src/browser_command'

test.group('Screenshot', () => {
  test('it can take a screenshot', async ({ assert, fs }) => {
    const targetPath = await fs.createPath('testScreenshot.png')

    await Browsershot.url('https://example.com').save(targetPath)

    assert.fileExists('testScreenshot.png')
    assert.mimeType(targetPath, 'image/png')
  })

  test('it can return a screenshot as base 64', async ({ expect }) => {
    const base64 = await Browsershot.url('https://example.com').base64Screenshot()

    expect(typeof base64 === 'string').toBeTruthy()
  })

  test('it can take a screenshot when using pipe', async ({ assert, fs }) => {
    const targetPath = await fs.createPath('testScreenshot.png')

    await Browsershot.url('https://example.com').usePipe().save(targetPath)

    assert.fileExists('testScreenshot.png')
    assert.mimeType(targetPath, 'image/png')
  })

  test('it can take a screenshot of arbitrary html', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('testScreenshot.png')

    await Browsershot.html('<h1>Hello world!!</h1>').save(targetPath)

    assert.fileExists('testScreenshot.png')
    assert.mimeType(targetPath, 'image/png')
  })

  test('it can take a full page screenshot', async ({ assert, fs }) => {
    const targetPath = await fs.createPath('testScreenshot.png')

    await Browsershot.url('https://github.com/spatie/browsershot').fullPage().save(targetPath)

    assert.fileExists('testScreenshot.png')
    assert.mimeType(targetPath, 'image/png')
  }).disableTimeout()

  test('it can take a highly customized screenshot', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('customScreenshot.png')

    await Browsershot.url('https://example.com')
      .clip(290, 80, 700, 290)
      .deviceScaleFactor(2)
      .dismissDialogs()
      .mobile()
      .touch()
      .windowSize(1280, 800)
      .save(targetPath)

    assert.fileExists('customScreenshot.png')
    assert.mimeType(targetPath, 'image/png')
  })

  test('it can take a screenshot of an element matching a selector', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('nodeScreenshot.png')

    await Browsershot.url('https://example.com').select('div').save(targetPath)

    assert.fileExists('nodeScreenshot.png')
    assert.mimeType(targetPath, 'image/png')
  })

  test('it can add a delay before taking a screenshot', async ({ fs, expect, assert }) => {
    const targetPath = await fs.createPath('testScreenshot.png')
    const delay = 1000

    const start = Date.now()

    await Browsershot.url('https://example.com').setDelay(delay).save(targetPath)

    const end = Date.now()

    assert.fileExists('testScreenshot.png')
    assert.mimeType(targetPath, 'image/png')

    expect(end - start).toBeGreaterThanOrEqual(delay)
  }).disableTimeout()

  test('it can get the output of a screenshot', async ({ assert, fs }) => {
    const output = await Browsershot.url('https://example.com').screenshot()

    const filePath = await fs.createPath('screenshot.png', output)

    assert.mimeType(filePath, 'image/png')
  })

  test('it can set type of screenshot', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('testScreenshot.jpg')

    await Browsershot.url('https://example.com').setScreenshotType('jpeg').save(targetPath)

    assert.fileExists('testScreenshot.jpg')
    assert.mimeType(targetPath, 'image/jpeg')
  })

  test('it will connect to remote instance and take screenshot', async ({ fs, assert }) => {
    const instance = Browsershot.url('https://example.com').setRemoteInstance()

    const command = BrowserCommand.screenshot(instance)

    assert.deepInclude(
      {
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
        type: 'png',
        remoteInstanceUrl: 'http://127.0.0.1:9222',
      },
      command.options
    )

    /*
     * to test the connection, uncomment the following code, and make sure you are running a chrome/chromium instance locally,
     * with the following param: --headless --remote-debugging-port=9222
     */
    const output = await instance.screenshot()

    const filePath = await fs.createPath('screenshot.png', output)

    assert.mimeType(filePath, 'image/png')
  })

  test('it will connect to a custom remote instance and take screenshot').run(
    async ({ fs, assert }) => {
      const instance = Browsershot.url('https://example.com').setRemoteInstance('127.0.0.1', 9999)

      const command = BrowserCommand.screenshot(instance)

      assert.deepInclude(
        {
          viewport: {
            width: 800,
            height: 600,
          },
          args: [],
          type: 'png',
          remoteInstanceUrl: 'http://127.0.0.1:9999',
        },
        command.options
      )

      /*
       * to test the connection, uncomment the following code, and make sure you are running a chrome/chromium instance locally,
       * with the following param: --headless --remote-debugging-port=9999
       */
      const output = await instance.screenshot()

      const filePath = await fs.createPath('screenshot.png', output)

      assert.mimeType(filePath, 'image/png')
    }
  )

  test('it will connect to a custom ws endpoint and take screenshot')
    .run(async ({ fs, assert, expect }) => {
      const instance = Browsershot.url('https://example.com').setWSEndpoint(
        'wss://chrome.browserless.io/'
      )

      const command = BrowserCommand.screenshot(instance)

      assert.deepInclude(
        {
          viewport: {
            width: 800,
            height: 600,
          },
          args: [],
          type: 'png',
          browserWSEndpoint: 'wss://chrome.browserless.io/',
        },
        command.options
      )

      // It should be online so mis-use the assetsContains because a 4xx error won't contain the word "browserless".
      const html = await Browsershot.url('https://chrome.browserless.io/json/').bodyHtml()

      // If it's offline then this will fail.
      expect(html).toContain('chrome.browserless.io')

      /* Now that we know the domain is online, assert the screenshot.
       * Although we can't be sure, because Browsershot itself falls back to launching a chromium instance in browser
       */
      const output = await instance.screenshot()

      const filePath = await fs.createPath('screenshot.png', output)

      assert.mimeType(filePath, 'image/png')
    })
    .disableTimeout()

  test('it can take a scaled screenshot', async ({ fs, assert }) => {
    const targetPath = await fs.createPath('testScreenshot.jpg')

    await Browsershot.url('https://example.com').scale(0.5).save(targetPath)

    assert.fileExists('testScreenshot.jpg')
    assert.mimeType(targetPath, 'image/jpeg')
  })
})
