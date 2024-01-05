import path from 'node:path'
import { WriteFileOptions } from 'node:fs'

import mime from 'mime-types'

import { Assert, assert } from '@japa/assert'
import { expect } from '@japa/expect'
import { fileSystem, FileSystem } from '@japa/file-system'
import { processCLIArgs, configure, run } from '@japa/runner'

FileSystem.macro(
  'createPath',
  async function (
    this: FileSystem,
    filePath: string,
    contents?: string,
    options?: WriteFileOptions
  ) {
    await this.create(filePath, contents || '', options)

    return path.join(this.basePath, filePath)
  }
)

Assert.macro('mimeType', async function (this: Assert, filePath: string, mimeType: string) {
  this.equal(mime.lookup(filePath), mimeType)
})

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
processCLIArgs(process.argv.slice(2))
configure({
  timeout: 5000,
  suites: [
    {
      name: 'unit',
      files: ['tests/unit/**/*.spec(.js|.ts)'],
    },
    {
      name: 'integration',
      files: ['tests/integration/**/*.spec(.js|.ts)'],
    },
  ],
  plugins: [assert(), expect(), fileSystem()],
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
