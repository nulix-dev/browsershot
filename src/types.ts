import {
  BoundingBox,
  ConsoleMessageLocation,
  ConsoleMessageType,
  Credentials,
  KnownDevices,
  MouseButton,
  Page,
  Protocol,
  PuppeteerLifeCycleEvent,
  Viewport,
  WaitForSelectorOptions,
} from 'puppeteer'
import { Polling } from './enums/polling'

export type ConsoleMessage = {
  type: ConsoleMessageType
  message: string
  location: ConsoleMessageLocation
  stackTrace: ConsoleMessageLocation[]
}

export type RedirectHistory = {
  url: string
  status: number
  reason: string
  headers: Record<string, string>
}

export type PageError = {
  name: string
  message: string
}

export type FailedRequest = {
  status: number
  url: string
}

export type RequestList = {
  url: string
}

export type PageType = {
  selector: string
  text: string
  delay: number
}

export type PageSelect = {
  selector: string
  value: string
}

export type PageClick = {
  selector: string
  button: MouseButton
  clickCount: number
  delay: number
}

export type PageCustomAction =
  | 'requestsList'
  | 'consoleMessages'
  | 'failedRequests'
  | 'redirectHistory'
  | 'pageErrors'

export type PageAction = {
  [K in keyof Page]: Page[K] extends (...args: any[]) => any ? K : never
}[keyof Page]

export type BrowserCommandOptions = {
  type?: string
  printBackground?: boolean
  omitBackground?: boolean
  tagged?: boolean
  scale?: number
  quality?: number
  remoteInstanceUrl?: string
  browserWSEndpoint?: string
  ignoreHttpsErrors?: boolean
  newHeadless?: boolean
  executablePath?: string
  path?: string
  args?: string[]
  pipe?: boolean
  env?: Record<string, string>
  disableJavascript?: boolean
  contentUrl?: string
  disableImages?: boolean
  blockDomains?: string[]
  blockUrls?: string[]
  extraNavigationHTTPHeaders?: Record<string, string>
  dismissDialogs?: boolean
  userAgent?: string
  device?: keyof typeof KnownDevices
  emulateMedia?: string
  viewport?: Viewport
  extraHTTPHeaders?: Record<string, string>
  authentication?: Credentials
  cookies?: Protocol.Network.CookieParam[]
  timeout?: number
  networkIdleTimeout?: number
  waitUntil?: PuppeteerLifeCycleEvent
  preventUnsuccessfulResponse?: boolean
  types?: PageType[]
  selects?: PageSelect[]
  clicks?: PageClick[]
  addStyleTag?: string
  addScriptTag?: string
  delay?: number
  initialPageNumber?: number
  selector?: string
  selectorIndex?: number
  clip?: BoundingBox
  function?: string
  functionPolling?: Polling
  functionTimeout?: number
  waitForSelector?: string
  waitForSelectorOptions?: WaitForSelectorOptions
  pageFunction?: string
}

export type ExceptionOutput = { type: 'UnsuccessfulResponse' | 'ElementNotFound'; status?: number }

export type Output = {
  requestsList: RequestList[]
  consoleMessages: ConsoleMessage[]
  failedRequests: FailedRequest[]
  redirectHistory: RedirectHistory[]
  pageErrors: PageError[]
  result?: string
  exception?: ExceptionOutput
}
