import { determineModuleTypes, clearCache } from '../src/sync'
import { join as joinPath } from 'path'

process.chdir(__dirname);

const pathToBadNodeModules = joinPath(__dirname, 'node_modules', '@namespace', 'dual-cjs-esm-4');

beforeEach(() => {
    clearCache();
})

describe('[SYNC API] webpack-node-module-types', () => {
    it('differentiates CJS and ESM packages', () => {
        expect.hasAssertions();

        const { cjs, esm } = determineModuleTypes();

        expect(cjs).toIncludeAllMembers([
            'cjs-1',
            'cjs-2',
            'cjs-3',
            'cjs-4',
        ]);

        expect(esm).toIncludeAllMembers([
            'esm-1',
            'esm-2',
            'esm-3',
            'esm-4',
        ]);
    });

    it('classifies CJS+ESM dual packages as ESM', () => {
        expect.hasAssertions();

        const { esm } = determineModuleTypes();

        expect(esm).toIncludeAllMembers([
            'dual-cjs-esm-1',
            'dual-cjs-esm-2',
            'dual-cjs-esm-3',
        ]);
    });

    it('deals with scoped packages', () => {
        expect.hasAssertions();

        const { esm } = determineModuleTypes();

        expect(esm).toIncludeAllMembers([
            '@namespace/dual-cjs-esm-4',
            '@namespace/dual-cjs-esm-5',
        ]);
    });

    it('ignores non-package directories under node_modules', () => {
        expect.hasAssertions();

        const { esm, cjs } = determineModuleTypes();

        expect(cjs).toHaveLength(4);
        expect(esm).toHaveLength(9);
    });

    it('throws on encountering illegal scope', () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-1'));

        expect(() => determineModuleTypes()).toThrow(/illegally-scoped/);
    });

    it('throws gracefully on JSON parse error', () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-2'));

        expect(() => determineModuleTypes()).toThrow(/failed parsing/);
    });

    it('throws if it cannot find package.json', () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-3'));

        expect(() => determineModuleTypes()).toThrow(/no such file/);
    });

    it('caches results', () => {
        expect.hasAssertions();
        process.chdir(__dirname);

        expect((determineModuleTypes()).cjs).toBe((determineModuleTypes()).cjs);
        expect((determineModuleTypes()).esm).toBe((determineModuleTypes()).esm);
    });

    it('ignores foreign files in node_modules directory', () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-4'));

        // ? Does not throw
        expect(() => determineModuleTypes()).not.toThrow();
    });
});
