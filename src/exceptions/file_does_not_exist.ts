export class FileDoesNotExistException extends Error {
  constructor(file: string) {
    super(`The file ${file} does not exist`)
  }
}
