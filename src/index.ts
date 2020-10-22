import { readdir, stat, readFile } from 'fs/promises'
import { join as joinPath, basename } from 'path'

let determined = false;
const cjs: string[] = [];
const esm: string[] = [];

type Export = string | { [key: string]: Export };

const isCjs = async (path: string) => {

    try{
        const pkg: {
            type?: string,
            main?: string,
            exports: Export,
            module?: string,
        } = JSON.parse((await readFile(joinPath(path, 'package.json'), { encoding: 'utf-8' })));

        if(!pkg)
            throw new Error(`could not find package.json`);

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

/**
 * Returns an object with keys `cjs` and `esm` each pointing to an array of
 * strings representing CJS and ES modules under node_modules, respectively.
 */
export async function determineModuleTypes() {
    if(!determined) {
        const MODULES_ROOT = joinPath(process.cwd(), 'node_modules');

        const determine = async (dir: string, scoped = false) => Promise.all((await readdir(dir)).map(file => {
            const path = joinPath(dir, file);

            return (async () => {
                if((await stat(path)).isDirectory()) {
                    if(!file.startsWith('.')) {
                        if(file.startsWith('@')) {
                            if(scoped) throw new Error(`encountered double-scoped package at "${path}"`);
                            await determine(path, true);
                        }

                        else {
                            (await isCjs(path) ? cjs : esm).push(scoped ? `${basename(dir)}/${file}` : file);
                        }
                    }
                }
            })();
        }));

        await determine(MODULES_ROOT);

        determined = true;
    }

    return { cjs, esm };
}
