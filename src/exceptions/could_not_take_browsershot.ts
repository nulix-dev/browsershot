export class CouldNotTakeBrowsershot extends Error {
  static chromeOutputEmpty(screenShotPath: string, output: string, command = {}) {
    const jsonCommand = JSON.stringify(command)

    const message = `<<<CONSOLE
            For some reason Chrome did not write a file at ${screenShotPath}.
            Command
            =======
            ${jsonCommand}
            Output
            ======
            ${output}
            CONSOLE;
          `

    return new this(message)
  }

  static outputFileDidNotHaveAnExtension(path: string) {
    return new this(
      `The given path ${path} did not contain an extension. Please append an extension.`
    )
  }
}
