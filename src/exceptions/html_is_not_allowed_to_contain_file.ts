export class HtmlIsNotAllowedToContainFile extends Error {
  constructor() {
    super('The specified HTML contains `file://`. This is not allowed.')
  }
}
