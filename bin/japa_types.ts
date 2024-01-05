import '@japa/assert'
import '@japa/file-system'
import { WriteFileOptions } from 'node:fs'

declare module '@japa/assert' {
  interface Assert {
    mimeType(filePath: string, mimeType: string): Promise<void>
  }
}

declare module '@japa/file-system' {
  interface FileSystem {
    createPath(filePath: string, contents?: string, options?: WriteFileOptions): Promise<string>
  }
}
