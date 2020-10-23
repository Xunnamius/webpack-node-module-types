[![Black Lives Matter!](https://api.ergodark.com/badges/blm "Join the movement!")](https://secure.actblue.com/donate/ms_blm_homepage_2019)
[![Maintenance status](https://img.shields.io/maintenance/active/2020 "Is this package maintained?")](https://www.npmjs.com/package/webpack-node-module-types)
[![Last commit timestamp](https://img.shields.io/github/last-commit/xunnamius/webpack-node-module-types/develop "When was the last commit to the official repo?")](https://www.npmjs.com/package/webpack-node-module-types)
[![Open issues](https://img.shields.io/github/issues/xunnamius/webpack-node-module-types "Number of known issues with this package")](https://www.npmjs.com/package/webpack-node-module-types)
[![Pull requests](https://img.shields.io/github/issues-pr/xunnamius/webpack-node-module-types "Number of open pull requests")](https://www.npmjs.com/package/webpack-node-module-types)
[![DavidDM dependencies](https://img.shields.io/david/xunnamius/webpack-node-module-types "Status of this package's dependencies")](https://david-dm.org/xunnamius/webpack-node-module-types)
[![Source license](https://img.shields.io/npm/l/webpack-node-module-types "This package's source license")](https://www.npmjs.com/package/webpack-node-module-types)
[![NPM version](https://api.ergodark.com/badges/npm-pkg-version/webpack-node-module-types "Install this package using npm or yarn!")](https://www.npmjs.com/package/webpack-node-module-types)

# webpack-node-module-types

This package attempts to determine the module type (ESM/`.mjs` vs
CJS/`.cjs`/`.js`) of each top-level package in `node_modules/`, including scoped
packages. This plugin should come to the same determination about a module's
type as Webpack does in the vast majority of cases.

The resolution algorithm is similar to
[Node's](https://nodejs.org/api/esm.html#esm_resolution_algorithm) with the
additional awareness of the `module` key. This package was originally created
for
[babel-plugin-transform-mjs-imports](https://github.com/Xunnamius/babel-plugin-transform-mjs-imports)
to help smooth over Typescript-to-CJS/ESM transpilation issues, but can be
useful whenever one needs to know how bundlers will attempt to load a package.

## Installation

```Bash
npm install --save-dev webpack-node-module-types
```

## Usage

```TypeScript
import { determineModuleTypes } from 'webpack-node-module-types'
```

Usage example from [Node's REPL](https://nodejs.org/api/repl.html#repl_repl)
listing this package's own CJS and ESM dependencies:

```JavaScript
determineModuleTypes().then(c => console.log(c))
Promise { <pending> }
> {
  cjs: [
    'acorn-globals',
    'abab',
    'acorn-jsx',
    'ajv',
    'ansi-colors',
    'ansi-escapes',
    'ajv-keywords',
    'ansi-styles',
    'ansi-regex',
    'anymatch',
    'argparse',
    'arr-flatten',
    'arr-diff',
    'arr-union',
    'array-includes',
    'array-union',
    'array.prototype.flat',
    'array-unique',
    'asn1',
    'assign-symbols',
    'assert-plus',
    'async-each',
    'astral-regex',
    'asynckit',
    'atob',
    'aws4',
    'babel-eslint',
    'babel-jest',
    'aws-sign2',
    'babel-loader',
    'babel-plugin-dynamic-import-node',
    'babel-plugin-istanbul',
    'babel-plugin-jest-hoist',
    'babel-preset-jest',
    'base',
    'balanced-match',
    'bcrypt-pbkdf',
    'babel-preset-current-node-syntax',
    'binary-extensions',
    'braces',
    'browser-process-hrtime',
    'brace-expansion',
    'bser',
    'browserslist',
    'buffer-from',
    'cache-base',
    'callsites',
    'caniuse-lite',
    'capture-exit',
    'caseless',
    'camelcase',
    'chalk',
    'chokidar',
    'char-regex',
    'ci-info',
    'class-utils',
    'chrome-trace-event',
    'cliui',
    'co',
    'collect-v8-coverage',
    'color-convert',
    'collection-visit',
    'color-name',
    'combined-stream',
    'commander',
    'command-line-usage',
    'component-emitter',
    'commondir',
    'concat-map',
    'copy-descriptor',
    'convert-source-map',
    'cross-spawn',
    'core-util-is',
    'core-js-compat',
    'cssom',
    'data-urls',
    'contains-path',
    'cssstyle',
    'debug',
    'dashdash',
    'decode-uri-component',
    'decamelize',
    'dedent',
    'deep-is',
    'deep-extend',
    'deepmerge',
    'define-property',
    'define-properties',
    'detect-newline',
    'domexception',
    'delayed-stream',
    'diff-sequences',
    'dir-glob',
    'doctrine',
    'ecc-jsbn',
    'emittery',
    'electron-to-chromium',
    'emoji-regex',
    'emojis-list',
    'end-of-stream',
    ... 529 more items
  ],
  esm: [
    'acorn',
    'acorn-walk',
    'array-back',
    'babel-plugin-source-map-support',
    'big.js',
    'colorette',
    'decimal.js',
    'escalade',
    'eslint-import-resolver-typescript',
    'eslint-utils',
    'esquery',
    'flatted',
    'get-package-type',
    'html-escaper',
    'json5',
    'lines-and-columns',
    'punycode',
    'rsvp',
    'terser',
    'tslib',
    'uuid',
    '@sinonjs/fake-timers',
    '@webassemblyjs/ast',
    '@webassemblyjs/floating-point-hex-parser',
    '@webassemblyjs/helper-api-error',
    '@webassemblyjs/helper-buffer',
    '@webassemblyjs/helper-code-frame',
    '@webassemblyjs/helper-fsm',
    '@webassemblyjs/helper-wasm-bytecode',
    '@webassemblyjs/helper-wasm-section',
    '@webassemblyjs/helper-module-context',
    '@webassemblyjs/ieee754',
    '@webassemblyjs/leb128',
    '@webassemblyjs/wasm-edit',
    '@webassemblyjs/utf8',
    '@webassemblyjs/wasm-opt',
    '@webassemblyjs/wasm-parser',
    '@webassemblyjs/wasm-gen',
    '@webassemblyjs/wast-parser',
    '@webassemblyjs/wast-printer',
    '@xtuc/ieee754'
  ]
}
```

As of November 2020, most of this package's dependencies are *not* offering ESM
entry points 🤯

## Contributing

**New issues and pull requests are always welcome and greatly appreciated!** If
you submit a pull request, take care to maintain the existing coding style and
add unit tests for any new or changed functionality. Please lint and test your
code, of course!

This package is published using
[publish-please](https://www.npmjs.com/package/publish-please) via `npx
publish-please`.

## Package Details

> You don't need to read this section to use this package, everything should
"just work"!

This is a simple [CJS2](https://github.com/webpack/webpack/issues/1114) package
with a default export.

[`package.json`](package.json) includes the [`exports` and
`main`][exports-main-key] keys, which point to the CJS2 entry point, the
[`type`][local-pkg] key, which is `commonjs`, and the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

## Release History

See [CHANGELOG.md](CHANGELOG.md).

[side-effects-key]: https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[exports-main-key]: https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[local-pkg]: https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
