import fs from 'node:fs'
import URL from 'node:url'

import puppet, {
  ConnectOptions,
  FrameWaitForFunctionOptions,
  GoToOptions,
  KnownDevices,
  Page,
  Browser as PuppeteerBrowser,
} from 'puppeteer'

import {
  ConsoleMessage,
  FailedRequest,
  Output,
  PageAction,
  PageError,
  RedirectHistory,
  RequestList,
} from './types.js'

import { BrowserCommand } from './browser_command.js'

export class Browser {
  protected requestsList: RequestList[] = []
  protected redirectHistory: RedirectHistory[] = []
  protected consoleMessages: ConsoleMessage[] = []
  protected failedRequests: FailedRequest[] = []
  protected pageErrors: PageError[] = []

  constructor(protected request: BrowserCommand) {}

  async callChrome() {
    let browser: PuppeteerBrowser | undefined
    let page: Page | undefined
    let remoteInstance: boolean = false

    const request = this.request

    try {
      if (request.options.remoteInstanceUrl || request.options.browserWSEndpoint) {
        // default options
        let options: ConnectOptions = {
          ignoreHTTPSErrors: request.options.ignoreHttpsErrors,
        }

        // choose only one method to connect to the browser instance
        if (request.options.remoteInstanceUrl) {
          options.browserURL = request.options.remoteInstanceUrl
        } else if (request.options.browserWSEndpoint) {
          options.browserWSEndpoint = request.options.browserWSEndpoint
        }

        try {
          browser = await puppet.connect(options)

          remoteInstance = true
        } catch (exception) {
          /** does nothing. fallbacks to launching a chromium instance */
        }
      }

      if (!browser) {
        browser = await puppet.launch({
          headless: 'new',
          ignoreHTTPSErrors: request.options.ignoreHttpsErrors,
          executablePath: request.options.executablePath,
          args: request.options.args || [],
          pipe: request.options.pipe || false,
          env: {
            ...(request.options.env || {}),
            ...process.env,
          },
        })
      }

      page = await browser.newPage()

      if (request.options && request.options.disableJavascript) {
        await page.setJavaScriptEnabled(false)
      }

      await page.setRequestInterception(true)

      const contentUrl = request.options.contentUrl
      const parsedContentUrl = contentUrl ? contentUrl.replace(/\/$/, '') : undefined
      let pageContent: Buffer | undefined

      if (contentUrl) {
        pageContent = fs.readFileSync(request.url.replace('file://', ''))
        request.url = contentUrl
      }

      page.on('console', (message) =>
        this.consoleMessages.push({
          type: message.type(),
          message: message.text(),
          location: message.location(),
          stackTrace: message.stackTrace(),
        })
      )

      page.on('pageerror', (msg) => {
        this.pageErrors.push({
          name: msg.name || 'unknown error',
          message: msg.message || msg.toString(),
        })
      })

      page.on('response', (response) => {
        if (
          response.request().isNavigationRequest() &&
          response.request().frame()?.parentFrame() === null
        ) {
          this.redirectHistory.push({
            url: response.request().url(),
            status: response.status(),
            reason: response.statusText(),
            headers: response.headers(),
          })
        }

        if (response.status() >= 200 && response.status() <= 399) {
          return
        }

        this.failedRequests.push({
          status: response.status(),
          url: response.url(),
        })
      })

      page.on('request', (interceptedRequest) => {
        var headers = interceptedRequest.headers()

        this.requestsList.push({
          url: interceptedRequest.url(),
        })

        if (request.options && request.options.disableImages) {
          if (interceptedRequest.resourceType() === 'image') {
            interceptedRequest.abort()
            return
          }
        }

        if (request.options && request.options.blockDomains) {
          const hostname = URL.parse(interceptedRequest.url()).hostname
          if (hostname && request.options.blockDomains.includes(hostname)) {
            interceptedRequest.abort()
            return
          }
        }

        if (request.options && request.options.blockUrls) {
          for (const element of request.options.blockUrls) {
            if (interceptedRequest.url().indexOf(element) >= 0) {
              interceptedRequest.abort()
              return
            }
          }
        }

        if (request.options && request.options.extraNavigationHTTPHeaders) {
          // Do nothing in case of non-navigation requests.
          if (interceptedRequest.isNavigationRequest()) {
            headers = Object.assign({}, headers, request.options.extraNavigationHTTPHeaders)
          }
        }

        if (pageContent) {
          const interceptedUrl = interceptedRequest.url().replace(/\/$/, '')

          // if content url matches the intercepted request url, will return the content fetched from the local file system
          if (interceptedUrl === parsedContentUrl) {
            interceptedRequest.respond({
              headers,
              body: pageContent,
            })
            return
          }
        }

        if (request.postParams) {
          const postParamsArray = request.postParams
          const queryString = Object.keys(postParamsArray)
            .map((key) => `${key}=${postParamsArray[key]}`)
            .join('&')

          interceptedRequest.continue({
            method: 'POST',
            postData: queryString,
            headers: {
              ...interceptedRequest.headers(),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          return
        }

        interceptedRequest.continue({ headers })
      })

      if (request.options && request.options.dismissDialogs) {
        page.on('dialog', async (dialog) => {
          await dialog.dismiss()
        })
      }

      if (request.options && request.options.userAgent) {
        await page.setUserAgent(request.options.userAgent)
      }

      if (request.options && request.options.device) {
        const devices = KnownDevices
        const device = devices[request.options.device]
        await page.emulate(device)
      }

      if (request.options && request.options.emulateMedia) {
        await page.emulateMediaType(request.options.emulateMedia)
      }

      if (request.options && request.options.viewport) {
        await page.setViewport(request.options.viewport)
      }

      if (request.options && request.options.extraHTTPHeaders) {
        await page.setExtraHTTPHeaders(request.options.extraHTTPHeaders)
      }

      if (request.options && request.options.authentication) {
        await page.authenticate(request.options.authentication)
      }

      if (request.options && request.options.cookies) {
        await page.setCookie(...request.options.cookies)
      }

      if (request.options && request.options.timeout) {
        await page.setDefaultNavigationTimeout(request.options.timeout)
      }

      const requestOptions: GoToOptions = {}

      if (request.options && request.options.networkIdleTimeout) {
        requestOptions.waitUntil = 'networkidle0'
        requestOptions.timeout = request.options.networkIdleTimeout
      } else if (request.options && request.options.waitUntil) {
        requestOptions.waitUntil = request.options.waitUntil
      }

      const response = await page.goto(request.url, requestOptions)

      if (request.options.preventUnsuccessfulResponse && response) {
        const status = response.status()

        if (status >= 400 && status < 600) {
          throw { type: 'UnsuccessfulResponse', status }
        }
      }

      if (request.options && request.options.disableImages) {
        await page.evaluate(() => {
          let images = document.getElementsByTagName('img')
          while (images.length > 0) {
            images[0].parentNode?.removeChild(images[0])
          }
        })
      }

      if (request.options && request.options.types) {
        for (let i = 0, len = request.options.types.length; i < len; i++) {
          let typeOptions = request.options.types[i]
          await page.type(typeOptions.selector, typeOptions.text, {
            delay: typeOptions.delay,
          })
        }
      }

      if (request.options && request.options.selects) {
        for (let i = 0, len = request.options.selects.length; i < len; i++) {
          let selectOptions = request.options.selects[i]
          await page.select(selectOptions.selector, selectOptions.value)
        }
      }

      if (request.options && request.options.clicks) {
        for (let i = 0, len = request.options.clicks.length; i < len; i++) {
          let clickOptions = request.options.clicks[i]
          await page.click(clickOptions.selector, {
            button: clickOptions.button,
            clickCount: clickOptions.clickCount,
            delay: clickOptions.delay,
          })
        }
      }

      if (request.options && request.options.addStyleTag) {
        await page.addStyleTag(JSON.parse(request.options.addStyleTag))
      }

      if (request.options && request.options.addScriptTag) {
        await page.addScriptTag(JSON.parse(request.options.addScriptTag))
      }

      if (request.options.delay) {
        await page.waitForTimeout(request.options.delay)
      }

      if (request.options.initialPageNumber) {
        await page.evaluate((initialPageNumber) => {
          ;(window as any).pageStart = initialPageNumber

          const style = document.createElement('style')
          style.type = 'text/css'
          style.innerHTML = '.empty-page { page-break-after: always; visibility: hidden; }'
          document.getElementsByTagName('head')[0].appendChild(style)

          const emptyPages = Array.from({ length: initialPageNumber }).map(() => {
            const emptyPage = document.createElement('div')
            emptyPage.className = 'empty-page'
            emptyPage.textContent = 'empty'
            return emptyPage
          })
          document.body.prepend(...emptyPages)
        }, request.options.initialPageNumber)
      }

      if (request.options.selector) {
        var element
        const index = request.options.selectorIndex || 0
        if (index) {
          element = await page.$$(request.options.selector)
          if (!element.length || typeof element[index] === 'undefined') {
            element = null
          } else {
            element = element[index]
          }
        } else {
          element = await page.$(request.options.selector)
        }
        if (element === null) {
          throw { type: 'ElementNotFound' }
        }

        request.options.clip = (await element.boundingBox()) || undefined
      }

      if (request.options.function) {
        let functionOptions: FrameWaitForFunctionOptions = {
          polling: request.options.functionPolling,
          timeout: request.options.functionTimeout || request.options.timeout,
        }
        await page.waitForFunction(request.options.function, functionOptions)
      }

      if (request.options.waitForSelector) {
        await page.waitForSelector(
          request.options.waitForSelector,
          request.options.waitForSelectorOptions
            ? request.options.waitForSelectorOptions
            : undefined
        )
      }

      const output = await this.getOutput(page)

      if (remoteInstance && page) {
        await page.close()
      }

      remoteInstance ? browser.disconnect() : browser.close()

      return output
    } catch (exception) {
      if (browser) {
        if (remoteInstance && page) {
          await page.close()
        }

        remoteInstance ? browser.disconnect() : browser.close()
      }

      const output = await this.getOutput()

      output.exception = exception

      return output
    }
  }

  protected async getOutput(page?: Page) {
    let output: Output = {
      requestsList: this.requestsList,
      consoleMessages: this.consoleMessages,
      failedRequests: this.failedRequests,
      redirectHistory: this.redirectHistory,
      pageErrors: this.pageErrors,
    }

    if (
      ![
        'requestsList',
        'consoleMessages',
        'failedRequests',
        'redirectHistory',
        'pageErrors',
      ].includes(this.request.action) &&
      page
    ) {
      if (this.request.action === 'evaluate') {
        output.result = (await page.evaluate(this.request.options.pageFunction || '')) as string
      } else {
        const result = await (page[this.request.action as PageAction] as any)(this.request.options)
        output.result = result.toString('base64')
      }
    }

    return output
  }
}
