# Convert a webpage to an image or pdf using headless Chrome

[![Latest Version](https://img.shields.io/github/release/nulix-dev/browsershot.svg?style=flat-square)](https://github.com/nulix-dev/browsershot/releases)
[![MIT Licensed](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![run-tests](https://img.shields.io/github/actions/workflow/status/nulix-dev/browsershot/checks.yml?label=tests&style=flat-square)](https://github.com/nulix-dev/browsershot/actions)

> **Note**
>
> This package is a Typescript version of the PHP package [spatie/browsershot](https://github.com/spatie/browsershot).

The package can convert a webpage to an image or pdf. The conversion is done behind the scenes by [Puppeteer](https://github.com/GoogleChrome/puppeteer) which controls a headless version of Google Chrome.

```bash
npm i @nulix/browsershot
```

Here's a quick example:

```ts
import { Browsershot } from '@nulix/browsershot'

// an image will be saved
Browsershot.url('https://example.com').save(pathToImage);
```

It will save a pdf if the path passed to the `save` method has a `pdf` extension.

```ts
// a pdf will be saved
Browsershot.url('https://example.com').save('example.pdf');
```

You can also use an arbitrary html input, simply replace the `url` method with `html`:

```ts
Browsershot.html('<h1>Hello world!!</h1>').save('example.pdf');
```

If your HTML input is already in a file locally use the :

```ts
Browsershot.htmlFromFilePath('/local/path/to/file.html').save('example.pdf');
```

Browsershot also can get the body of an html page after JavaScript has been executed:

```ts
Browsershot.url('https://example.com').bodyHtml(); // returns the html of the body
```

If you wish to retrieve an array list with all of the requests that the page triggered you can do so:

```ts
const requests = Browsershot.url('https://example.com')
    .triggeredRequests();

for (const request as requests) {
    const url = request.url; //https://example.com/
}
```

To use Chrome's new [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome) pass the `newHeadless` method:

```ts
Browsershot.url('https://example.com').newHeadless().save(pathToImage);
```

## Documentation

All documentation is available [on our documentation site](https://example.com).

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
