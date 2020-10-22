[![Black Lives Matter!](https://api.ergodark.com/badges/blm "Join the movement!")](https://secure.actblue.com/donate/ms_blm_homepage_2019)
[![Maintenance status](https://img.shields.io/maintenance/active/2020 "Is this package maintained?")](https://www.npmjs.com/package/webpack-node-module-types)
[![Last commit timestamp](https://img.shields.io/github/last-commit/xunnamius/webpack-node-module-types/develop "When was the last commit to the official repo?")](https://www.npmjs.com/package/webpack-node-module-types)
[![Open issues](https://img.shields.io/github/issues/xunnamius/webpack-node-module-types "Number of known issues with this package")](https://www.npmjs.com/package/webpack-node-module-types)
[![Pull requests](https://img.shields.io/github/issues-pr/xunnamius/webpack-node-module-types "Number of open pull requests")](https://www.npmjs.com/package/webpack-node-module-types)
[![DavidDM dependencies](https://img.shields.io/david/xunnamius/webpack-node-module-types "Status of this package's dependencies")](https://david-dm.org/xunnamius/webpack-node-module-types)
[![Source license](https://img.shields.io/npm/l/webpack-node-module-types "This package's source license")](https://www.npmjs.com/package/webpack-node-module-types)
[![NPM version](https://api.ergodark.com/badges/npm-pkg-version/webpack-node-module-types "Install this package using npm or yarn!")](https://www.npmjs.com/package/webpack-node-module-types)

# webpack-node-module-types

This package attempts to determine the module type (ESM/`.mjs` vs CJS/`.cjs`) of
each package in `node_modules/`. This plugin should come to the same
determination about a module's type as Webpack would.

Originally created to gather module metadata for
[webpack-node-module-types](https://github.com/Xunnamius/webpack-node-module-types).

## Installation

```Bash
npm install --save-dev webpack-node-module-types
```

## Usage

```TypeScript
import { determineModuleTypes } from 'webpack-node-module-types'

const { cjs, esm } = determineModuleTypes();

console.log('array of CJS module name strings (including scope if applicable):', cjs);
console.log('array of ESM name strings (including scope if applicable):', esm);
```

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
