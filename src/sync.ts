import { readdirSync as readdir, statSync as stat, readFileSync as readFile } from 'fs'
import { join as joinPath, basename } from 'path'

let determined = false;
const cjs: string[] = [];
const esm: string[] = [];

type Export = string | { [key: string]: Export };

const isCjs = (path: string) => {
    try{
        const pkg: {
            type?: string,
            main?: string,
            exports: Export,
            module?: string,
        } = JSON.parse((readFile(joinPath(path, 'package.json'), { encoding: 'utf-8' })));

        // * https://nodejs.org/api/esm.html#esm_packages
        // We classify a package as ESM if its package.json has:
        //   - a `module` key
        //   - a `type` key with the value 'module'
        //   - a `main` key with a value ending in '.mjs'
        //   - a sub-key (any depth) of the `export` key with a value ending in '.mjs'
        //
        // Otherwise, we classify it as a CJS package

        const isMjsExtensionInExportObject = (e: Export): boolean => {
            if(!e) return false;

            if(typeof e == 'string')
                return e.endsWith('.mjs');

            return Object.values(e).some(k => isMjsExtensionInExportObject(k));
        };

        return !('module' in pkg
            || pkg.type == 'module'
            || pkg.main?.endsWith('.mjs')
            || isMjsExtensionInExportObject(pkg.exports));
    }

    catch(e) {
        throw new Error(`failed parsing package.json for module at "${path}": ${e}`);
    }
};

const determine = (dir: string, scoped = false) => {
    readdir(dir).map(file => {
        const path = joinPath(dir, file);

        if((stat(path)).isDirectory()) {
            if(!file.startsWith('.')) {
                if(file.startsWith('@')) {
                    if(scoped) throw new Error(`encountered illegally-scoped package at "${path}"`);
                    determine(path, true);
                }

                else {
                    (isCjs(path) ? cjs : esm).push(scoped ? `${basename(dir)}/${file}` : file);
                }
            }
        }
    });
};

/**
 * Returns an object with keys `cjs` and `esm` each pointing to an array of
 * strings representing CJS and ES modules under node_modules, respectively.
 */
export function determineModuleTypes() {
    if(!determined) {
        determine(joinPath(process.cwd(), 'node_modules'));
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
