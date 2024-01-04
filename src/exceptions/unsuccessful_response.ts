export class UnsuccessfulResponse extends Error {
  constructor(url: string, code: string | number) {
    super(`The given url ${url} responds with code ${code}`)
  }
}
