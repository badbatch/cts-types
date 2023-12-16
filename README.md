# cts-types

A command line script for generating d.cts files from d.ts files.

[![npm version](https://badge.fury.io/js/cts-types.svg)](https://badge.fury.io/js/cts-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Supporting esmodules and commonjs in the same Typescript library that is itself an esmodule is not straight forward. At the time of creating this library, Typescript's new module resolution strategies requires esmodule libraries that support commonjs to provide a set of types suffixed with `d.cts` instead of `d.ts`.

Without `d.cts` files, Typescript assumes the library only supports esmodules and throws an error when you try to `require()` the commonjs version of the library. For more information about this, read the Github issue about [NodeNext duel package resolution](https://github.com/microsoft/TypeScript/issues/50466).

`cts-types` streamlines the process of generating `d.cts` files. Just install it as a dev dependency and run the `cts-types build` command in your pipeline after generating the `d.ts` files. The script will not just copy and rename files, it will also update references to `.d.cts` and `.d.cts.map` in the content of a file.

## Install package

```sh
# terminal
npm add cts-types --save-dev
```

## Usage

```jsonc
// package.json
{
  ...
  "types": "./dist/types/cjs/index.d.cts",
  "exports": {
    "types": {
      "import": "./dist/types/esm/index.d.ts",
      "require": "./dist/types/cjs/index.d.cts"
    },
    ...
  },
  ...
  "scripts": {
    ...
    "compile:types": "tsc --project ./tsconfig.build.json && cts-types build dist/types/esm dist/types/cjs",
    ...
  }
  ...
}
```

```jsonc
// tsconfig.build.json
{
  ...
  "compilerOptions": {
    ...
    "outDir": "dist/types/esm"
    ...
  },
  ...
}
```

## API

```sh
ctsTypes build <input> <output>

Build .d.cts type files from .d.ts files to provide types for both esm and cjs outputs.

Positionals:
  input   The directory where the .d.ts files are located, relative to the
          project root                                       [string] [required]
  output  The directory where the .d.cts files should be output, relative to the
          project root                                       [string] [required]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --verbose  Whether to output verbose logs                            [boolean]
```

### A note on `output`

The output should be in the same folder as or a sibling folder of the input in order for the source maps to work correctly. The source maps include a path to the source file and that path is based on the location of the input file. This library does not currently support updating the relative path of source files in the `.map` files.

To get around this limitation, either do not provide an `output` path (and the output will be written to the `input` path) or have the `output` path leaf directory be a sibling of the `input` path leaf directory, i.e. `input` of `dist/types/esm` and `output` of `dist/types/cjs`.

## Changelog

Check out the [features, fixes and more](CHANGELOG.md) that go into each major, minor and patch version.

## License

cts-types is [MIT Licensed](LICENSE).
