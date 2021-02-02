[![Black Lives Matter!](https://api.ergodark.com/badges/blm "Join the movement!")](https://secure.actblue.com/donate/ms_blm_homepage_2019)
[![Maintenance status](https://img.shields.io/maintenance/active/2021 "Is this package maintained?")](https://www.npmjs.com/package/webpack-node-module-types)
[![Last commit timestamp](https://img.shields.io/github/last-commit/xunnamius/webpack-node-module-types "When was the last commit to the official repo?")](https://www.npmjs.com/package/webpack-node-module-types)
[![Open issues](https://img.shields.io/github/issues/xunnamius/webpack-node-module-types "Number of known issues with this package")](https://www.npmjs.com/package/webpack-node-module-types)
[![Pull requests](https://img.shields.io/github/issues-pr/xunnamius/webpack-node-module-types "Number of open pull requests")](https://www.npmjs.com/package/webpack-node-module-types)
[![DavidDM dependencies](https://img.shields.io/david/xunnamius/webpack-node-module-types "Status of this package's dependencies")](https://david-dm.org/xunnamius/webpack-node-module-types)
[![Source license](https://img.shields.io/npm/l/webpack-node-module-types "This package's source license")](https://www.npmjs.com/package/webpack-node-module-types)
[![NPM version](https://api.ergodark.com/badges/npm-pkg-version/webpack-node-module-types 'Install this package using npm or yarn!')](https://www.npmjs.com/package/webpack-node-module-types)

# webpack-node-module-types

This package attempts to determine the module type (ESM/`.mjs` vs
CJS/`.cjs`/`.js`) of each top-level package in `node_modules/`, including scoped
packages. It comes to the same determination about a module's type as Webpack
does in the vast majority of cases. In other cases, like with modules that
present as CJS format but return , an ES module might be misclassified as CJS.

The resolution algorithm is based on
[Node's ESM_FORMAT algorithm to determine module format](https://nodejs.org/api/esm.html#esm_resolution_algorithm)
with the additional awareness of the `module` key; hence, we classify a package
as ESM if its `package.json` has any of the following:

- A `main` key with a value ending in '.mjs'
- A sub-key (any depth) of the `export` key with a value ending in '.mjs'
- A `type` key with the value 'module'
- A `module` key

It cannot be determined through package metadata if a module exports
`__esModule = true`, so transpiled ES modules that don't meet any of the above
requirements will be misclassified.

This package was originally created for
[babel-plugin-transform-default-named-imports](https://github.com/Xunnamius/babel-plugin-transform-default-named-imports)
to help smooth over Typescript-to-CJS/ESM transpilation issues, but can be
useful whenever one needs to know how Webpack will attempt to load a package.

## Installation

```Bash
npm install --save-dev webpack-node-module-types
```

## Usage

In addition to the bare import, this module exports two deep exports: `/sync`
and `/async`.

```TypeScript
// Returns the asynchronous promise-based API (faster, better)
import { determineModuleTypes } from 'webpack-node-module-types'

// Returns the synchronous API (useful for plugin authors)
import { determineModuleTypes } from 'webpack-node-module-types/sync'

// Returns the same asynchronous promise-based API as the first version
import { determineModuleTypes } from 'webpack-node-module-types/async'
```

Usage example from [Node's REPL](https://nodejs.org/api/repl.html#repl_repl)
listing this package's own CJS and ESM dependencies:

```JavaScript
> const { determineModuleTypes } = require('webpack-node-module-types/sync')
undefined
> console.log(determineModuleTypes())
{
  cjs: [
    '@babel/cli',
    '@babel/code-frame',
    '@babel/compat-data',
    '@babel/core',
    '@babel/generator',
    '@babel/helper-annotate-as-pure',
    '@babel/helper-builder-binary-assignment-operator-visitor',
    '@babel/helper-compilation-targets',
    '@babel/helper-create-class-features-plugin',
    '@babel/helper-create-regexp-features-plugin',
    '@babel/helper-define-map',
    '@babel/helper-explode-assignable-expression',
    '@babel/helper-function-name',
    '@babel/helper-get-function-arity',
    '@babel/helper-hoist-variables',
    '@babel/helper-module-imports',
    '@babel/helper-optimise-call-expression',
    '@babel/helper-plugin-utils',
    '@babel/helper-regex',
    '@babel/helper-remap-async-to-generator',
    '@babel/helper-skip-transparent-expression-wrappers',
    '@babel/helper-split-export-declaration',
    '@babel/helper-validator-identifier',
    '@babel/helper-validator-option',
    '@babel/helper-wrap-function',
    '@babel/highlight',
    '@babel/parser',
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-unicode-property-regex',
    '@babel/plugin-syntax-async-generators',
    '@babel/plugin-syntax-bigint',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-export-default-from',
    '@babel/plugin-syntax-export-namespace-from',
    '@babel/plugin-syntax-function-bind',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-json-strings',
    '@babel/plugin-syntax-logical-assignment-operators',
    '@babel/plugin-syntax-nullish-coalescing-operator',
    '@babel/plugin-syntax-numeric-separator',
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-syntax-optional-catch-binding',
    '@babel/plugin-syntax-optional-chaining',
    '@babel/plugin-syntax-top-level-await',
    '@babel/plugin-syntax-typescript',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-block-scoped-functions',
    '@babel/plugin-transform-block-scoping',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-computed-properties',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-dotall-regex',
    '@babel/plugin-transform-duplicate-keys',
    '@babel/plugin-transform-exponentiation-operator',
    '@babel/plugin-transform-for-of',
    '@babel/plugin-transform-function-name',
    '@babel/plugin-transform-literals',
    '@babel/plugin-transform-member-expression-literals',
    '@babel/plugin-transform-modules-amd',
    '@babel/plugin-transform-modules-systemjs',
    '@babel/plugin-transform-modules-umd',
    '@babel/plugin-transform-named-capturing-groups-regex',
    '@babel/plugin-transform-new-target',
    '@babel/plugin-transform-object-super',
    '@babel/plugin-transform-property-literals',
    '@babel/plugin-transform-regenerator',
    '@babel/plugin-transform-reserved-words',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-spread',
    '@babel/plugin-transform-sticky-regex',
    '@babel/plugin-transform-template-literals',
    '@babel/plugin-transform-typeof-symbol',
    '@babel/plugin-transform-typescript',
    '@babel/plugin-transform-unicode-escapes',
    '@babel/plugin-transform-unicode-regex',
    '@babel/preset-env',
    '@babel/preset-modules',
    '@babel/preset-typescript',
    '@babel/runtime',
    '@babel/template',
    '@babel/traverse',
    '@babel/types',
    '@bcoe/v8-coverage',
    '@cnakazawa/watch',
    '@eslint/eslintrc',
    '@istanbuljs/load-nyc-config',
    '@istanbuljs/schema',
    ... 529 more items
  ],
  esm: [
    '@sinonjs/fake-timers',
    '@webassemblyjs/ast',
    '@webassemblyjs/floating-point-hex-parser',
    '@webassemblyjs/helper-api-error',
    '@webassemblyjs/helper-buffer',
    '@webassemblyjs/helper-code-frame',
    '@webassemblyjs/helper-fsm',
    '@webassemblyjs/helper-module-context',
    '@webassemblyjs/helper-wasm-bytecode',
    '@webassemblyjs/helper-wasm-section',
    '@webassemblyjs/ieee754',
    '@webassemblyjs/leb128',
    '@webassemblyjs/utf8',
    '@webassemblyjs/wasm-edit',
    '@webassemblyjs/wasm-gen',
    '@webassemblyjs/wasm-opt',
    '@webassemblyjs/wasm-parser',
    '@webassemblyjs/wast-parser',
    '@webassemblyjs/wast-printer',
    '@xtuc/ieee754',
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
    'uuid'
  ]
}
```

As of February 2021, most of this package's dependencies are _not_ offering ESM
entry points 🤯

## Contributing

**New issues and pull requests are always welcome and greatly appreciated!** If
you submit a pull request, take care to maintain the existing coding style and
add unit tests for any new or changed functionality. Please lint and test your
code, of course!

### NPM Scripts

Run `npm run list-tasks` to see which of the following scripts are available for
this project.

> Using these scripts requires a linux-like development environment. None of the
> scripts are likely to work on non-POSIX environments. If you're on Windows,
> use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

#### Development

- `npm run repl` to run a buffered TypeScript-Babel REPL
- `npm test` to run the unit tests and gather test coverage data
  - Look for HTML files under `coverage/`
- `npm run check-build` to run the integration tests
- `npm run check-types` to run a project-wide type check
- `npm run test-repeat` to run the entire test suite 100 times
  - Good for spotting bad async code and heisenbugs
  - Uses `__test-repeat` NPM script under the hood
- `npm run dev` to start a development server or instance
- `npm run generate` to transpile config files (under `config/`) from scratch
- `npm run regenerate` to quickly re-transpile config files (under `config/`)

#### Building

- `npm run clean` to delete all build process artifacts
- `npm run build` to compile `src/` into `dist/`, which is what makes it into
  the published package
- `npm run build-docs` to re-build the documentation
- `npm run build-externals` to compile `external-scripts/` into
  `external-scripts/bin/`
- `npm run build-stats` to gather statistics about Webpack (look for
  `bundle-stats.json`)

#### Publishing

- `npm run start` to start a production instance
- `npm run fixup` to run pre-publication tests, rebuilds (like documentation),
  and validations
  - Triggered automatically by
    [publish-please](https://www.npmjs.com/package/publish-please)

#### NPX

- `npx publish-please` to publish the package
- `npx sort-package-json` to consistently sort `package.json`
- `npx npm-force-resolutions` to forcefully patch security audit problems

## Package Details

> You don't need to read this section to use this package, everything should
> "just work"!

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

[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[exports-main-key]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
