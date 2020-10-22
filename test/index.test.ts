import { determineModuleTypes } from '../src/index'

describe('webpack-node-module-types', () => {
    it('differentiates CJS and ESM packages', () => {
        expect.hasAssertions();

        const { cjs, esm } = determineModuleTypes();

        expect(cjs).toIncludeAllMembers([
            'cjs-1',
            'cjs-2',
            'cjs-3',
            'cjs-4',
            'cjs-5',
        ]);

        expect(esm).toIncludeAllMembers([
            'esm-1',
            'esm-2',
            'esm-3',
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

        expect(cjs).toHaveLength(5);
        expect(esm).toHaveLength(8);
    });
});
