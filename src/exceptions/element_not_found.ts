export class ElementNotFound extends Error {
  constructor(selector: string) {
    super(`The given selector ${selector} did not match any elements`)
  }
}
