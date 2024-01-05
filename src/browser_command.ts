import { Browsershot } from './browsershot.js'
import { BrowserCommandOptions, PageAction, PageCustomAction } from './types.js'
import { isEmpty } from './utils.js'

export class BrowserCommand {
  url: string
  action: PageAction | PageCustomAction
  options: BrowserCommandOptions
  postParams?: Record<string, string>

  constructor(
    url: string,
    action: PageAction | PageCustomAction,
    options: BrowserCommandOptions = {},
    postParams?: Record<string, string>
  ) {
    this.url = url
    this.action = action
    this.options = options

    if (postParams && !isEmpty(postParams)) {
      this.postParams = postParams
    }
  }

  static pdf(browsershot: Browsershot, targetPath?: string) {
    const { url, options } = browsershot.getCommandProps()

    const command = new this(url, 'pdf', options, browsershot.postParams)

    if (targetPath) {
      command.options.path = targetPath
    }

    if (browsershot._showBackground) {
      command.options.printBackground = true
    }

    if (browsershot._transparentBackground) {
      command.options.omitBackground = true
    }

    if (browsershot._taggedPdf) {
      command.options.tagged = true
    }

    if (browsershot._scale) {
      command.options.scale = browsershot._scale
    }

    return command
  }

  static screenshot(browsershot: Browsershot, targetPath?: string) {
    const { url, options } = browsershot.getCommandProps()

    const command = new this(url, 'screenshot', options, browsershot.postParams)

    command.options.type = browsershot._screenshotType

    if (targetPath) {
      command.options.path = targetPath
    }

    if (browsershot._screenshotQuality) {
      command.options.quality = browsershot._screenshotQuality
    }

    if (!browsershot._showScreenshotBackground) {
      command.options.omitBackground = true
    }

    return command
  }

  static bodyHtml(browsershot: Browsershot) {
    const { url, options } = browsershot.getCommandProps()

    return new this(url, 'content', options, browsershot.postParams)
  }

  static evaluate(browsershot: Browsershot, pageFunction: string) {
    const { url, options } = browsershot.getCommandProps()

    const command = new this(url, 'evaluate', options, browsershot.postParams)

    command.options.pageFunction = pageFunction

    return command
  }

  static generic(browsershot: Browsershot, action: PageAction | PageCustomAction) {
    const { url, options } = browsershot.getCommandProps()

    return new this(url, action, options)
  }
}
