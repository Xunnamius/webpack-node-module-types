import { determineModuleTypes, clearCache } from '../src/index'
import { join as joinPath } from 'path'

process.chdir(__dirname);

const pathToBadNodeModules = joinPath(__dirname, 'node_modules', '@namespace', 'dual-cjs-esm-4');

beforeEach(() => {
    clearCache();
})

describe('webpack-node-module-types', () => {
    it('differentiates CJS and ESM packages', async () => {
        expect.hasAssertions();

        const { cjs, esm } = await determineModuleTypes();

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

    it('classifies CJS+ESM dual packages as ESM', async () => {
        expect.hasAssertions();

        const { esm } = await determineModuleTypes();

        expect(esm).toIncludeAllMembers([
            'dual-cjs-esm-1',
            'dual-cjs-esm-2',
            'dual-cjs-esm-3',
        ]);
    });

    it('deals with scoped packages', async () => {
        expect.hasAssertions();

        const { esm } = await determineModuleTypes();

        expect(esm).toIncludeAllMembers([
            '@namespace/dual-cjs-esm-4',
            '@namespace/dual-cjs-esm-5',
        ]);
    });

    it('ignores non-package directories under node_modules', async () => {
        expect.hasAssertions();

        const { esm, cjs } = await determineModuleTypes();

        expect(cjs).toHaveLength(4);
        expect(esm).toHaveLength(9);
    });

    it('throws on encountering illegal scope', async () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-1'));

        await expect(determineModuleTypes()).rejects.toThrow(/illegally-scoped/);
    });

    it('throws gracefully on JSON parse error', async () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-2'));

        await expect(determineModuleTypes()).rejects.toThrow(/failed parsing/);
    });

    it('throws if it cannot find package.json', async () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-3'));

        await expect(determineModuleTypes()).rejects.toThrow(/no such file/);
    });

    it('caches results', async () => {
        expect.hasAssertions();
        process.chdir(__dirname);

        expect((await determineModuleTypes()).cjs).toBe((await determineModuleTypes()).cjs);
        expect((await determineModuleTypes()).esm).toBe((await determineModuleTypes()).esm);
    });

    it('ignores foreign files in node_modules directory', async () => {
        expect.hasAssertions();
        process.chdir(joinPath(pathToBadNodeModules, 'bad-4'));

        // ? Does not throw
        await expect(determineModuleTypes()).resolves.toBeDefined();
    });
});
