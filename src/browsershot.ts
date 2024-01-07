import tmp from 'tmp'
import fs from 'node:fs'
import { dset } from 'dset'
import path from 'node:path'

import { isEmpty } from './utils'
import { BrowserCommandOptions, PageSelect, PageType } from './types'

import { FileUrlNotAllowed } from './exceptions/file_url_not_allowed'
import { FileDoesNotExistException } from './exceptions/file_does_not_exist'
import { CouldNotTakeBrowsershot } from './exceptions/could_not_take_browsershot'
import { HtmlIsNotAllowedToContainFile } from './exceptions/html_is_not_allowed_to_contain_file'

import { Unit } from './enums/unit'
import { Format } from './enums/format'
import { Polling } from './enums/polling'

import { Browser } from './browser'
import { BrowserCommand } from './browser_command'
import { ChromiumResult } from './chromium_result'
import { ElementNotFound } from './exceptions/element_not_found'
import { UnsuccessfulResponse } from './exceptions/unsuccessful_response'
import { KnownDevices, MouseButton, Protocol, WaitForSelectorOptions } from 'puppeteer'

export class Browsershot {
  _taggedPdf = false
  _noSandbox = false
  _showBackground = false
  _transparentBackground = false
  _showScreenshotBackground = true

  _screenshotType = 'png'

  _timeout = 60

  _scale?: number
  _screenshotQuality?: number

  protected url = ''
  protected html = ''
  protected proxyServer = ''

  protected temporaryHtmlFile?: tmp.FileResult

  protected chromiumResult?: ChromiumResult

  protected chromiumArguments: Array<string> = []

  protected _additionalOptions: Partial<BrowserCommandOptions> = {}
  protected _postParams: Record<string, string> = {}

  constructor(url = '', deviceEmulate = false) {
    this.url = url

    if (!deviceEmulate) {
      this.windowSize(800, 600)
    }
  }

  static url(url: string) {
    return new this().setUrl(url)
  }

  static html(html: string) {
    return new this().setHtml(html)
  }

  static htmlFromFilePath(filePath: string) {
    return new this().setHtmlFromFilePath(filePath)
  }

  get finalContentsUrl(): string {
    return this.html ? this.createTemporaryHtmlFile() : this.url
  }

  get additionalOptions() {
    return this._additionalOptions
  }

  get postParams() {
    return this._postParams
  }

  get output() {
    return this.chromiumResult
  }

  getOptionArgs() {
    const args = this.chromiumArguments

    if (this._noSandbox) {
      args.push('--no-sandbox')
    }

    if (this.proxyServer) {
      args.push('--proxy-server=' + this.proxyServer)
    }

    return args
  }

  getCommandProps() {
    const url = this.finalContentsUrl
    const options = this.additionalOptions

    options.args = this.getOptionArgs()

    return { url, options }
  }

  setProxyServer(proxyServer: string) {
    this.proxyServer = proxyServer

    return this
  }

  post(postParams: Record<string, string> = {}) {
    this._postParams = postParams

    return this
  }

  showBackground() {
    this._showBackground = true
    this._showScreenshotBackground = true

    return this
  }

  hideBackground() {
    this._showBackground = false
    this._showScreenshotBackground = false

    return this
  }

  transparentBackground() {
    this._transparentBackground = true

    return this
  }

  taggedPdf() {
    this._taggedPdf = true

    return this
  }

  noSandbox() {
    this._noSandbox = true

    return this
  }

  setScreenshotType(type: string, quality?: number) {
    this._screenshotType = type

    if (quality) {
      this._screenshotQuality = quality
    }

    return this
  }

  scale(scale: number) {
    this._scale = scale

    return this
  }

  timeout(timeout: number) {
    this._timeout = timeout

    return this.setOption('timeout', timeout * 1000)
  }

  setChromePath(executablePath: string) {
    return this.setOption('executablePath', executablePath)
  }

  setExtraHttpHeaders(extraHTTPHeaders: Record<string, string>) {
    return this.setOption('extraHTTPHeaders', extraHTTPHeaders)
  }

  setExtraNavigationHttpHeaders(extraNavigationHTTPHeaders: Record<string, string>) {
    return this.setOption('extraNavigationHTTPHeaders', extraNavigationHTTPHeaders)
  }

  authenticate(username: string, password: string) {
    return this.setOption('authentication', { username, password })
  }

  waitUntilNetworkIdle(strict = true) {
    return this.setOption('waitUntil', strict ? 'networkidle0' : 'networkidle2')
  }

  waitForFunction(
    functionName: string,
    polling: Polling = Polling.RequestAnimationFrame,
    timeout = 0
  ) {
    return this.setOption('functionPolling', polling)
      .setOption('functionTimeout', timeout)
      .setOption('function', functionName)
  }

  clip(x: number, y: number, width: number, height: number) {
    return this.setOption('clip', { x, y, width, height })
  }

  preventUnsuccessfulResponse(preventUnsuccessfulResponse = true) {
    return this.setOption('preventUnsuccessfulResponse', preventUnsuccessfulResponse)
  }

  select(selector: string, index = 0) {
    return this.selectorIndex(index).setOption('selector', selector)
  }

  selectorIndex(index: number) {
    return this.setOption('selectorIndex', index)
  }

  showBrowserHeaderAndFooter() {
    return this.setOption('displayHeaderFooter', true)
  }

  hideBrowserHeaderAndFooter() {
    return this.setOption('displayHeaderFooter', false)
  }

  windowSize(width: number, height: number) {
    return this.setOption('viewport.width', width).setOption('viewport.height', height)
  }

  headerHtml(html: string) {
    return this.setOption('headerTemplate', html)
  }

  footerHtml(html: string) {
    return this.setOption('footerTemplate', html)
  }

  deviceScaleFactor(deviceScaleFactor: number) {
    // Google Chrome currently supports values of 1, 2, and 3.
    return this.setOption('viewport.deviceScaleFactor', Math.max(1, Math.min(3, deviceScaleFactor)))
  }

  fullPage() {
    return this.setOption('fullPage', true)
  }

  ignoreHttpsErrors() {
    return this.setOption('ignoreHttpsErrors', true)
  }

  mobile(mobile = true) {
    return this.setOption('viewport.isMobile', mobile)
  }

  touch(touch = true) {
    return this.setOption('viewport.hasTouch', touch)
  }

  landscape(landscape = true) {
    return this.setOption('landscape', landscape)
  }

  dismissDialogs() {
    return this.setOption('dismissDialogs', true)
  }

  disableJavascript() {
    return this.setOption('disableJavascript', true)
  }

  disableImages() {
    return this.setOption('disableImages', true)
  }

  blockUrls(urls: string[]) {
    return this.setOption('blockUrls', urls)
  }

  blockDomains(domains: string[]) {
    return this.setOption('blockDomains', domains)
  }

  pages(pages: string) {
    return this.setOption('pageRanges', pages)
  }

  paperSize(width: number, height: number, unit = Unit.Millimeter) {
    return this.setOption('width', `${width}${unit}`).setOption('height', `${height}${unit}`)
  }

  // paper format
  format(format: Format) {
    return this.setOption('format', format)
  }

  userAgent(userAgent: string) {
    return this.setOption('userAgent', userAgent)
  }

  device(device: keyof typeof KnownDevices) {
    return this.setOption('device', device)
  }

  emulateMedia(media?: string | null) {
    return this.setOption('emulateMedia', media)
  }

  newHeadless() {
    return this.setOption('newHeadless', true)
  }

  setDelay(delayInMilliseconds: number) {
    return this.setOption('delay', delayInMilliseconds)
  }

  delay(delayInMilliseconds: number) {
    return this.setDelay(delayInMilliseconds)
  }

  setRemoteInstance(ip = '127.0.0.1', port = 9222) {
    // assuring that ip and port does actually contains a value
    if (ip && port) {
      this.setOption('remoteInstanceUrl', 'http://' + ip + ':' + port)
    }

    return this
  }

  setWSEndpoint(endpoint: string) {
    if (endpoint) {
      this.setOption('browserWSEndpoint', endpoint)
    }

    return this
  }

  usePipe() {
    return this.setOption('pipe', true)
  }

  setEnvironmentOptions(options: Record<string, string> = {}) {
    return this.setOption('env', options)
  }

  setContentUrl(contentUrl: string) {
    return this.html ? this.setOption('contentUrl', contentUrl) : this
  }

  initialPageNumber(initialPage = 1) {
    return this.setOption('initialPageNumber', initialPage - 1).pages(`${initialPage}-`)
  }

  waitForSelector(selector: string, options: WaitForSelectorOptions = {}) {
    this.setOption('waitForSelector', selector)

    if (!isEmpty(options)) {
      this.setOption('waitForSelectorOptions', options)
    }

    return this
  }

  useCookies(cookiesData: Record<string, string>, domain?: string) {
    if (!domain) {
      domain = new URL(this.url)['host']
    }

    let cookies = Object.entries(cookiesData).map(([name, value]) => ({
      name,
      value,
      domain,
    })) as Protocol.Network.CookieParam[]

    if (this.additionalOptions.cookies) {
      cookies = cookies.concat(this.additionalOptions.cookies)
    }

    this.setOption('cookies', cookies)

    return this
  }

  click(selector: string, button: MouseButton = 'left', clickCount = 1, delay = 0) {
    const clicks = this.additionalOptions.clicks ?? []

    clicks.push({ selector, button, clickCount, delay })

    return this.setOption('clicks', clicks)
  }

  selectOption(selector: string, value = '') {
    const dropdownSelects: PageSelect[] = this.additionalOptions['selects'] ?? []

    dropdownSelects.push({ selector, value })

    return this.setOption('selects', dropdownSelects)
  }

  type(selector: string, text = '', delay = 0) {
    const types: PageType[] = this.additionalOptions['types'] ?? []

    types.push({ selector, text, delay })

    return this.setOption('types', types)
  }

  margins(top: number, right: number, bottom: number, left: number, unit = Unit.Millimeter) {
    return this.setOption('margin', {
      top: `${top}${unit}`, // 100px
      right: `${right}${unit}`,
      bottom: `${bottom}${unit}`,
      left: `${left}${unit}`,
    })
  }

  setUrl(url: string) {
    if (url.toLowerCase().startsWith('file://')) {
      throw new FileUrlNotAllowed()
    }

    this.url = url
    this.html = ''

    return this
  }

  setHtml(html: string) {
    if (html.toLowerCase().includes('file://')) {
      throw new HtmlIsNotAllowedToContainFile()
    }

    this.url = ''
    this.html = html

    this.hideBrowserHeaderAndFooter()

    return this
  }

  setHtmlFromFilePath(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new FileDoesNotExistException(filePath)
    }

    this.url = 'file://' + filePath
    this.html = ''

    return this
  }

  setOption(key: string, value: any) {
    dset(this.additionalOptions, key, value)

    return this
  }

  hideHeader() {
    return this.headerHtml('<p></p>')
  }

  hideFooter() {
    return this.footerHtml('<p></p>')
  }

  setUserDataDir(absolutePath: string) {
    return this.addChromiumArguments({ 'user-data-dir': absolutePath })
  }

  userDataDir(absolutePath: string) {
    return this.setUserDataDir(absolutePath)
  }

  addChromiumArguments(args: Record<string, string | null>) {
    for (const [arg, value] of Object.entries(args)) {
      if (!value) {
        this.chromiumArguments.push(`--${arg}`)
      } else {
        this.chromiumArguments.push(`--${arg}=${value}`)
      }
    }

    return this
  }

  async save(targetPath: string) {
    const extension = path.extname(targetPath).toLowerCase()

    if (extension === '') {
      throw CouldNotTakeBrowsershot.outputFileDidNotHaveAnExtension(targetPath)
    }

    if (extension === '.pdf') {
      return await this.savePdf(targetPath)
    }

    const command = BrowserCommand.screenshot(this, targetPath)

    const output = await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    if (!fs.existsSync(targetPath)) {
      throw CouldNotTakeBrowsershot.chromeOutputEmpty(targetPath, output, command)
    }
  }

  async bodyHtml() {
    const command = BrowserCommand.bodyHtml(this)

    const html = await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return html
  }

  async base64Screenshot() {
    const command = BrowserCommand.screenshot(this)

    const encodedImage = await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return encodedImage
  }

  async screenshot() {
    const output = await this.base64Screenshot()

    return Buffer.from(output, 'base64')
  }

  async base64pdf() {
    const command = BrowserCommand.pdf(this)

    const encodedPdf = await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return encodedPdf
  }

  async pdf() {
    const output = await this.base64pdf()

    return Buffer.from(output, 'base64')
  }

  async savePdf(targetPath: string) {
    const command = BrowserCommand.pdf(this, targetPath)

    const output = await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    if (!fs.existsSync(targetPath)) {
      throw CouldNotTakeBrowsershot.chromeOutputEmpty(targetPath, output)
    }
  }

  async evaluate(pageFunction: string) {
    const command = BrowserCommand.evaluate(this, pageFunction)

    const evaluation = await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return evaluation
  }

  async triggeredRequests() {
    const requests = this.chromiumResult?.getRequestsList()

    if (requests) return requests

    const command = BrowserCommand.generic(this, 'requestsList')

    await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return this.chromiumResult?.getRequestsList()
  }

  async redirectHistory() {
    const redirectHistory = this.chromiumResult?.getRedirectHistory()

    if (redirectHistory) return redirectHistory

    const command = BrowserCommand.generic(this, 'redirectHistory')

    await this.callBrowser(command)

    return this.chromiumResult?.getRedirectHistory()
  }

  async consoleMessages() {
    const messages = this.chromiumResult?.getConsoleMessages()

    if (messages) return messages

    const command = BrowserCommand.generic(this, 'consoleMessages')

    await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return this.chromiumResult?.getConsoleMessages()
  }

  async failedRequests() {
    const requests = this.chromiumResult?.getFailedRequests()

    if (requests) return requests

    const command = BrowserCommand.generic(this, 'failedRequests')

    await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return this.chromiumResult?.getFailedRequests()
  }

  async pageErrors() {
    const pageErrors = this.chromiumResult?.getPageErrors()

    if (pageErrors) return pageErrors

    const command = BrowserCommand.generic(this, 'pageErrors')

    await this.callBrowser(command)

    this.cleanupTemporaryHtmlFile()

    return this.chromiumResult?.getPageErrors()
  }

  protected createTemporaryHtmlFile(): string {
    const tmpFile = tmp.fileSync({ postfix: '.html' })

    this.temporaryHtmlFile = tmpFile

    const filePath = this.temporaryHtmlFile.name

    fs.writeFileSync(filePath, this.html)

    return `file://${filePath}`
  }

  protected cleanupTemporaryHtmlFile() {
    if (this.temporaryHtmlFile) {
      this.temporaryHtmlFile.removeCallback()
    }
  }

  protected async callBrowser(command: BrowserCommand) {
    const browser = new Browser(command)

    const output = await browser.callChrome()

    if (output.exception) {
      if (output.exception.type === 'ElementNotFound') {
        throw new ElementNotFound(command.options.selector!)
      }

      if (output.exception.type === 'UnsuccessfulResponse') {
        throw new UnsuccessfulResponse(command.url, output.exception.status!)
      }

      throw output.exception
    }

    const chromeResult = new ChromiumResult(output)

    this.chromiumResult = chromeResult

    return chromeResult.getResult()
  }
}
