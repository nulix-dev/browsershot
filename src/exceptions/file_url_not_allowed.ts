export class FileUrlNotAllowed extends Error {
  constructor() {
    super('An URL is not allow to start with file://')
  }
}
