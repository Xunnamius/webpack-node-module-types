
/**
 * Returns an object with keys `cjs` and `esm` each pointing to an array of
 * strings representing CJS and ES modules under node_modules, respectively.
 */
export function determineModuleTypes() {
    const cjs: string[] = [];
    const esm: string[] = [];

    // ...

    return { cjs, esm };
}
