import { determineModuleTypes } from '../src/index'

process.chdir(__dirname);

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
});
