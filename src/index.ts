import fs from 'fs';
import { join as joinPath, basename, dirname, sep } from 'path';

const { readdir, stat, readFile } = fs.promises;

let determined = false;
const cjs: string[] = [];
const esm: string[] = [];

type Export = string | { [key: string]: Export };

const isCjs = async (path: string) => {
  try {
    const pkg: {
      type?: string;
      main?: string;
      exports: Export;
      module?: string;
    } = JSON.parse(await readFile(joinPath(path, 'package.json'), { encoding: 'utf-8' }));

    // * https://nodejs.org/api/esm.html#esm_resolution_algorithm
    // We classify a package as ESM if its package.json has:
    //   - a `module` key
    //   - a `type` key with the value 'module'
    //   - a `main` key with a value ending in '.mjs'
    //   - a sub-key (any depth) of `export` with a value ending in '.mjs'
    //
    // Otherwise, we classify it as a CJS package

    const isMjsExtensionInExportObject = (e: Export): boolean => {
      if (!e) return false;
      if (typeof e === 'string') return e.endsWith('.mjs');
      return Object.values(e).some((k) => isMjsExtensionInExportObject(k));
    };

    return !(
      'module' in pkg ||
      pkg.type === 'module' ||
      pkg.main?.endsWith('.mjs') ||
      isMjsExtensionInExportObject(pkg.exports)
    );
  } catch (e) {
    throw new Error(`failed parsing package.json for module at "${path}": ${e}`);
  }
};

const determine = async (dir: string, scoped = false) => {
  await Promise.all(
    (
      await readdir(dir)
    ).map((file) => {
      return (async () => {
        const path = joinPath(dir, file);

        if ((await stat(path)).isDirectory()) {
          if (!file.startsWith('.')) {
            if (file.startsWith('@')) {
              if (scoped)
                throw new Error(`encountered illegally-scoped package at "${path}"`);
              await determine(path, true);
            } else {
              const pkg = scoped ? `${basename(dir)}/${file}` : file;
              if (!cjs.includes(pkg) && !esm.includes(pkg)) {
                ((await isCjs(path)) ? cjs : esm).push(pkg);
              }
            }
          }
        }
      })();
    })
  );
};

/**
 * Returns an object with keys `cjs` and `esm` each pointing to an array of
 * strings representing CJS and ES modules under node_modules, respectively.
 *
 * Accepts a `rootMode` parameter of either `"local"`, `"upward"`, or a path to
 * node_modules relative to the current working directory (starting with `"./"`
 * or `"../"`). Defaults to `"local"`. If `"upward"` is used, package types in
 * the local node_modules directory, if it exists, override those in the upward
 * node_modules directory. On the other hand, if a relative path is given, its
 * contents, if it exists, override those in the local node_modules directory.
 */
export async function determineModuleTypes(
  { rootMode }: { rootMode: string } = { rootMode: 'local' }
) {
  if (!determined) {
    const cwd = process.cwd();

    if (rootMode != 'local') {
      const isRelativePath = rootMode.startsWith('./') || rootMode.startsWith('../');

      if (isRelativePath) {
        try {
          await determine(joinPath(cwd, rootMode));
        } catch (e) {
          if ((e as { code?: string }).code !== 'ENOENT') {
            throw e;
          }
        }

        const path = joinPath(cwd, 'node_modules');
        try {
          await determine(path);
        } catch (e) {
          throw new Error(
            `failed to find local node_modules directory at "${path}": ${e}`
          );
        }
      } else if (rootMode === 'upward') {
        try {
          await determine(joinPath(cwd, 'node_modules'));
        } catch (e) {
          if ((e as { code?: string }).code !== 'ENOENT') {
            throw e;
          }
        }

        let parent = cwd;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            parent = dirname(parent);
            // eslint-disable-next-line no-await-in-loop
            await determine(joinPath(parent, 'node_modules'));
            break;
          } catch (e) {
            if ((e as { code?: string }).code === 'ENOENT') {
              if (dirname(parent).lastIndexOf(sep) <= 0) {
                throw new Error(
                  'failed to find node_modules directory in any parent dir in upward root mode'
                );
              } else {
                continue;
              }
            } else {
              throw e;
            }
          }
        }
      } else {
        throw new Error(
          'invalid rootMode option. Valid options are: "local", "upward", and a path starting with "./" or "../"'
        );
      }
    } else {
      await determine(joinPath(cwd, 'node_modules'));
    }

    determined = true;
  }

  return { cjs, esm };
}

/**
 * Clear the internal cache (refresh view of node_modules). Otherwise, the
 * results of `determineModuleTypes()` is memoized.
 */
export function clearCache() {
  cjs.splice(0, cjs.length);
  esm.splice(0, esm.length);
  determined = false;
}
