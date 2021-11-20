[![Black Lives Matter!](https://api.ergodark.com/badges/blm 'Join the movement!')](https://secure.actblue.com/donate/ms_blm_homepage_2019)
[![Maintenance status](https://img.shields.io/maintenance/active/2021 'Is this package maintained?')](https://www.npmjs.com/package/webpack-node-module-types)
[![Last commit timestamp](https://img.shields.io/github/last-commit/xunnamius/webpack-node-module-types 'When was the last commit to the official repo?')](https://www.npmjs.com/package/webpack-node-module-types)
[![Open issues](https://img.shields.io/github/issues/xunnamius/webpack-node-module-types 'Number of known issues with this package')](https://www.npmjs.com/package/webpack-node-module-types)
[![Pull requests](https://img.shields.io/github/issues-pr/xunnamius/webpack-node-module-types 'Number of open pull requests')](https://www.npmjs.com/package/webpack-node-module-types)
[![Source license](https://img.shields.io/npm/l/webpack-node-module-types "This package's source license")](https://www.npmjs.com/package/webpack-node-module-types)
[![NPM version](https://api.ergodark.com/badges/npm-pkg-version/webpack-node-module-types 'Install this package using npm or yarn!')](https://www.npmjs.com/package/webpack-node-module-types)

# webpack-node-module-types

This package attempts to determine the module type (ESM/`.mjs` vs
CJS/`.cjs`/`.js`) of each top-level package in `node_modules/`, including scoped
packages. It comes to the same determination about a module's type as Webpack
does in the vast majority of cases. In other cases, like with modules that
present as CJS format, an ES module might be misclassified as CJS.

The resolution algorithm is based on
[Node's ESM_FORMAT algorithm to determine module format](https://nodejs.org/api/esm.html#esm_resolution_algorithm)
with the additional awareness of the `module` key; hence, we classify a package
as ESM if its `package.json` has any of the following:

- A `main` key with a value ending in `".mjs"`
- A sub-key (any depth) of the `export` key with a value ending in `".mjs"`
- A `type` key with the value `"module"`
- A `module` key

It cannot be determined through package metadata alone if a module exports
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
and `/async`. Both CJS `require()` and ESM-style `import` syntax are supported.

```TypeScript
// Returns the asynchronous promise-based API (faster, better)
import { determineModuleTypes } from 'webpack-node-module-types';

// Returns the synchronous API (useful for plugin authors)
import { determineModuleTypes } from 'webpack-node-module-types/sync';

// Returns the same asynchronous promise-based API as the first version
import { determineModuleTypes } from 'webpack-node-module-types/async';
```

Here's an example from [Node's REPL](https://nodejs.org/api/repl.html#repl_repl)
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
    ... 621 more items
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
    ... 33 more items
  ]
}
```

As of February 2021, most of this package's dependencies are _not_ offering ESM
entry points 🤯

### Monorepo Support

As of version `1.2.0`, `webpack-node-module-types` supports monorepo setups
through the `rootMode` parameter. Similar to
[Babel's root-mode flag](https://babeljs.io/docs/en/config-files#root-babelconfigjson-file),
`{ rootMode: "upward" }` makes `webpack-node-module-types` search from the
working directory parent upward until it finds an additional `node_modules`
directory to scrutinize. If no higher level `node_modules` directory is found,
an error is thrown.

Packages found under any local `node_modules` directory, if it exists, take
precedence over those found in a higher-level `node_modules` directory.

Example:

```TypeScript
// process.cwd() => /repos/my-workspace/pkg-1
const { determineModuleTypes } = require('webpack-node-module-types/sync');
console.log(determineModuleTypes({ rootMode: "upward" }));
// Will find:
//   - /repos/my-workspace/packages/pkg-1/node_modules (highest precedence, optional)
//   - /repos/my-workspace/node_modules
```

> `rootMode` is set to "local" by default.

In addition to `"upward"` and `"local"`, `rootMode` also accepts an explicit
`node_modules` path (beginning with `./` or `../`) relative to the current
working directory. When used in this way, packages found under the relative
`node_modules` directory take precedence over those found in any local
`node_modules` directory, if it exists.

Example:

```TypeScript
// process.cwd() => /repos/my-workspace
const { determineModuleTypes } = require('webpack-node-module-types/sync');
console.log(determineModuleTypes({ rootMode: "./packages/pkg-1/node_modules" }));
// Will find:
//   - /repos/my-workspace/node_modules (optional)
//   - /repos/my-workspace/packages/pkg-1/node_modules (highest precedence)
```

## Documentation

This is a simple [CJS2](https://github.com/webpack/webpack/issues/1114) package
with a default export.

[`package.json`](package.json) includes the [`exports` and
`main`][exports-main-key] keys, which point to the CJS2 entry point, the
[`type`][local-pkg] key, which is `commonjs`, and the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

## Contributing

**New issues and pull requests are always welcome and greatly appreciated!** If
you submit a pull request, take care to maintain the existing coding style and
add unit tests for any new or changed functionality. Please lint and test your
code, of course!

[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[exports-main-key]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
