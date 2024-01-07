import { test } from '@japa/runner'
import { Browsershot, Format, Unit } from '../../index'
import { BrowserCommand } from '../../src/browser_command'

test.group('BrowserCommand', () => {
  test('it can create a command to generate a screenshot', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .clip(100, 50, 600, 400)
      .deviceScaleFactor(2)
      .fullPage()
      .dismissDialogs()
      .setScreenshotType('png', 1)
      .windowSize(1920, 1080)

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'screenshot')

    assert.deepInclude(
      {
        clip: { x: 100, y: 50, width: 600, height: 400 },
        path: 'screenshot.png',
        fullPage: true,
        dismissDialogs: true,
        quality: 1,
        viewport: { deviceScaleFactor: 2, width: 1920, height: 1080 },
        args: [],
        type: 'png',
      },
      command.options
    )
  })

  test('it can create a command to generate a screenshot and omit the background').run(
    ({ assert }) => {
      const browsershot = Browsershot.url('https://example.com')
        .clip(100, 50, 600, 400)
        .deviceScaleFactor(2)
        .hideBackground()
        .windowSize(1920, 1080)

      const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

      assert.isUndefined(command.postParams)

      assert.equal(command.url, 'https://example.com')
      assert.equal(command.action, 'screenshot')

      assert.deepInclude(
        {
          clip: { x: 100, y: 50, width: 600, height: 400 },
          path: 'screenshot.png',
          fullPage: true,
          dismissDialogs: true,
          omitBackground: true,
          viewport: { deviceScaleFactor: 2, width: 1920, height: 1080 },
          args: [],
          type: 'png',
        },
        command.options
      )
    }
  )

  test('it can create a command to generate a pdf', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .transparentBackground()
      .device('iPhone 11')
      .landscape()
      .margins(10, 20, 30, 40)
      .scale(1)
      .pages('1-3')
      .setContentUrl('')
      .initialPageNumber(1)
      .paperSize(210, 148)

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.isUndefined(command.options.contentUrl)

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        initialPageNumber: 0,
        device: 'iPhone 11',
        printBackground: true,
        omitBackground: true,
        scale: 1,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-',
        width: '210mm',
        height: '148mm',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with tags', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .transparentBackground()
      .taggedPdf()
      .landscape()
      .margins(10, 20, 30, 40)
      .pages('1-3')
      .paperSize(210, 148)

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        printBackground: true,
        omitBackground: true,
        tagged: true,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-3',
        width: '210mm',
        height: '148mm',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with a custom header', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .landscape()
      .margins(10, 20, 30, 40)
      .pages('1-3')
      .paperSize(210, 148)
      .showBrowserHeaderAndFooter()
      .headerHtml('<p>Test Header</p>')

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        printBackground: true,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-3',
        width: '210mm',
        height: '148mm',
        displayHeaderFooter: true,
        headerTemplate: '<p>Test Header</p>',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with a custom footer', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .landscape()
      .margins(10, 20, 30, 40)
      .pages('1-3')
      .paperSize(210, 148)
      .showBrowserHeaderAndFooter()
      .footerHtml('<p>Test Footer</p>')

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        printBackground: true,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-3',
        width: '210mm',
        height: '148mm',
        displayHeaderFooter: true,
        footerTemplate: '<p>Test Footer</p>',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with the header hidden', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .landscape()
      .margins(10, 20, 30, 40)
      .pages('1-3')
      .paperSize(210, 148)
      .showBrowserHeaderAndFooter()
      .hideHeader()

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        printBackground: true,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-3',
        width: '210mm',
        height: '148mm',
        displayHeaderFooter: true,
        headerTemplate: '<p></p>',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with the footer hidden', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .landscape()
      .margins(10, 20, 30, 40)
      .pages('1-3')
      .paperSize(210, 148)
      .showBrowserHeaderAndFooter()
      .hideFooter()

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        printBackground: true,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-3',
        width: '210mm',
        height: '148mm',
        displayHeaderFooter: true,
        footerTemplate: '<p></p>',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with paper format', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .showBackground()
      .landscape()
      .margins(10, 20, 30, 40)
      .pages('1-3')
      .format(Format.A4)

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        printBackground: true,
        landscape: true,
        margin: { top: '10mm', right: '20mm', bottom: '30mm', left: '40mm' },
        pageRanges: '1-3',
        format: 'a4',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can create a command to generate a pdf with custom paper size unit', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .paperSize(8.3, 11.7, Unit.Inch)
      .margins(0.39, 0.78, 1.18, 1.57, Unit.Inch)

    const command = BrowserCommand.pdf(browsershot, 'screenshot.pdf')

    assert.isUndefined(command.postParams)

    assert.equal(command.url, 'https://example.com')
    assert.equal(command.action, 'pdf')

    assert.deepInclude(
      {
        path: 'screenshot.pdf',
        margin: { top: '0.39in', right: '0.78in', bottom: '1.18in', left: '1.57in' },
        width: '8.3in',
        height: '11.7in',
        viewport: {
          width: 800,
          height: 600,
        },
        args: [],
      },
      command.options
    )
  })

  test('it can use given user agent', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').userAgent('my_special_snowflake')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.userAgent, 'my_special_snowflake')
  })

  test('it can set emulate media option', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').emulateMedia('screen')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.emulateMedia, 'screen')
  })

  test('it can set emulate media option to undefined', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').emulateMedia()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isUndefined(command.options.emulateMedia)
  })

  test('it can use pipe', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').usePipe()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isTrue(command.options.pipe)
  })

  test('it can run without sandbox', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').noSandbox()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.args!, ['--no-sandbox'])
  })

  test('it can disable javascript', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').disableJavascript()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isTrue(command.options.disableJavascript)
  })

  test('it can disable images', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').disableImages()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isTrue(command.options.disableImages)
  })

  test('it can block urls', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').blockUrls([
      'example.com/cm-notify?pi=outbrain',
      'sync.outbrain.com/cookie-sync?p=bidswitch',
    ])
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.blockUrls, [
      'example.com/cm-notify?pi=outbrain',
      'sync.outbrain.com/cookie-sync?p=bidswitch',
    ])
  })

  test('it can block domains', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').blockDomains([
      'googletagmanager.com',
      'google-analytics.com',
    ])
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.blockDomains, ['googletagmanager.com', 'google-analytics.com'])
  })

  test('it can ignore https errors', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').ignoreHttpsErrors()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isTrue(command.options.ignoreHttpsErrors)
  })

  test('it can set arbitrary options', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .setOption('foo.bar', 100)
      .setOption('foo.bar', 150)
      .setOption('foo.baz', 200)
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepInclude(
      {
        path: 'screenshot.png',
        viewport: {
          width: 800,
          height: 600,
        },
        foo: {
          bar: 150,
          baz: 200,
        },
        args: [],
        type: 'png',
      },
      command.options
    )
  })

  test('it can use a proxy server', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').setProxyServer('1.2.3.4:8080')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.args!, ['--proxy-server=1.2.3.4:8080'])
  })

  test('it can send extra http headers', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').setExtraHttpHeaders({
      'extra-http-header': 'extra-http-header',
    })
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.extraHTTPHeaders, { 'extra-http-header': 'extra-http-header' })
  })

  test('it can send extra navigation http headers', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').setExtraNavigationHttpHeaders({
      'extra-http-header': 'extra-http-header',
    })
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.extraNavigationHTTPHeaders, {
      'extra-http-header': 'extra-http-header',
    })
  })

  test('it can authenticate', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').authenticate('username', 'password')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.authentication, { username: 'username', password: 'password' })
  })

  test('it can wait until network idle', ({ assert }) => {
    let browsershot = Browsershot.url('https://example.com').waitUntilNetworkIdle()
    let command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.waitUntil, 'networkidle0')

    browsershot = browsershot.waitUntilNetworkIdle(false)
    command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.waitUntil, 'networkidle2')
  })

  test('it can send cookies', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .useCookies({ theme: 'light', sessionToken: 'abc123' })
      .useCookies({ theme: 'dark' }, 'ui.example.com')

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.cookies!, 3)
    assert.includeDeepMembers(command.options.cookies!, [
      {
        name: 'theme',
        value: 'dark',
        domain: 'ui.example.com',
      },
      {
        name: 'theme',
        value: 'light',
        domain: 'example.com',
      },
      {
        name: 'sessionToken',
        value: 'abc123',
        domain: 'example.com',
      },
    ])
  })

  test('it can send post request', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').post({ foo: 'bar' })
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.postParams, { foo: 'bar' })
  })

  test('it can click on the page', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .click('#selector1')
      .click('#selector2', 'right', 2, 1)

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.clicks!, 2)
    assert.includeDeepMembers(command.options.clicks!, [
      {
        selector: '#selector1',
        button: 'left',
        clickCount: 1,
        delay: 0,
      },
      {
        selector: '#selector2',
        button: 'right',
        clickCount: 2,
        delay: 1,
      },
    ])
  })

  test('it can add a timeout to puppeteer', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').timeout(123)
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.timeout, 123000)
  })

  test('it can add a wait for function to puppeteer', ({ assert }) => {
    const browsershot =
      Browsershot.url('https://example.com').waitForFunction('window.innerWidth < 100')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.function, 'window.innerWidth < 100')
    assert.equal(command.options.functionPolling, 'raf')
    assert.equal(command.options.functionTimeout, 0)
  })

  test('it can add a wait for selector', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').waitForSelector('.wait_for_me')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.waitForSelector, '.wait_for_me')
  })

  test('it can add a wait for selector and provide options', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').waitForSelector('.wait_for_me', {
      visible: true,
    })

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.waitForSelector, '.wait_for_me')
    assert.deepEqual(command.options.waitForSelectorOptions, { visible: true })
  })

  test('it can input form fields and post and get the body html', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .type('#selector1', 'Hello, is it me you are looking for?')
      .click('#selector2')
      .delay(2000)

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.clicks!, 1)
    assert.deepEqual(command.options.clicks![0], {
      selector: '#selector2',
      button: 'left',
      clickCount: 1,
      delay: 0,
    })

    assert.lengthOf(command.options.types!, 1)
    assert.deepEqual(command.options.types![0], {
      selector: '#selector1',
      text: 'Hello, is it me you are looking for?',
      delay: 0,
    })

    assert.equal(command.options.delay, 2000)
  })

  test('it can change select fields and post and get the body html', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com')
      .selectOption('#selector1', 'option_one')
      .click('#selector2')
      .setDelay(2000)

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.clicks!, 1)
    assert.deepEqual(command.options.clicks![0], {
      selector: '#selector2',
      button: 'left',
      clickCount: 1,
      delay: 0,
    })

    assert.lengthOf(command.options.selects!, 1)
    assert.deepEqual(command.options.selects![0], {
      selector: '#selector1',
      value: 'option_one',
    })

    assert.equal(command.options.delay, 2000)
  })

  test('it will auto prefix chromium arguments', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').addChromiumArguments({
      'please-autoprefix-me': null,
    })

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.args!, 1)
    assert.equal(command.options.args![0], '--please-autoprefix-me')
  })

  test('it will allow many chromium arguments', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').addChromiumArguments({
      'my-custom-arg': null,
      'another-argument': 'some-value',
      'yet-another-arg': 'foo',
    })

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.args!, 3)
    assert.includeMembers(command.options.args!, [
      '--my-custom-arg',
      '--another-argument=some-value',
      '--yet-another-arg=foo',
    ])
  })

  test('it will set user data dir arg flag', ({ assert }) => {
    const dataDir = 'something'

    const browsershot = Browsershot.url('https://example.com').userDataDir(dataDir)
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.lengthOf(command.options.args!, 1)
    assert.includeMembers(command.options.args!, [`--user-data-dir=${dataDir}`])
  })

  test('it will allow passing environment variables', ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').setEnvironmentOptions({
      TZ: 'Pacific/Auckland',
    })

    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.deepEqual(command.options.env!, {
      TZ: 'Pacific/Auckland',
    })
  })

  test('it will allow passing a content url', ({ assert }) => {
    const browsershot =
      Browsershot.html('<h1>Hello world!!</h1>').setContentUrl('https://example.com')
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.equal(command.options.contentUrl, 'https://example.com')
    assert.include(command.url, 'file://')
  })

  test('it should set the new headless flag when using the new method', async ({ assert }) => {
    const browsershot = Browsershot.url('https://example.com').newHeadless()
    const command = BrowserCommand.screenshot(browsershot, 'screenshot.png')

    assert.isTrue(command.options.newHeadless)
  })
})
