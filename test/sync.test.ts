import { determineModuleTypes, clearCache } from '../src/sync';
import { join, basename, dirname } from 'path';
import { asMockedFunction } from './setup';

// TODO: use fixtures lib

const polyrepo1Dir = `${__dirname}/fixtures/polyrepo-1`;
const polyrepo2Dir = `${__dirname}/fixtures/polyrepo-2`;
const monorepo1Dir = `${__dirname}/fixtures/monorepo-1/packages/fake-pkg`;
const monorepo2Dir = `${__dirname}/fixtures/monorepo-2/packages/fake-pkg`;

const pathActual = jest.requireActual('path');
const joinPath = pathActual.join;

const pathToBadNodeModules = joinPath(
  polyrepo1Dir,
  'node_modules',
  '@namespace',
  'dual-cjs-esm-4'
);

jest.mock('path', () => ({
  join: jest.fn(),
  basename: jest.fn(),
  dirname: jest.fn(),
  sep: jest.requireActual('path').sep
}));

const mockedJoin = asMockedFunction(join);
const mockedBasename = asMockedFunction(basename);
const mockedDirname = asMockedFunction(dirname);

beforeEach(() => {
  clearCache();
  process.chdir(polyrepo1Dir);
  mockedJoin.mockImplementation(pathActual.join);
  mockedBasename.mockImplementation(pathActual.basename);
  mockedDirname.mockImplementation(pathActual.dirname);
});

describe('[SYNC API] webpack-node-module-types', () => {
  it('differentiates CJS and ESM packages', () => {
    expect.hasAssertions();

    const { cjs, esm } = determineModuleTypes();

    expect(cjs).toIncludeAllMembers(['cjs-1', 'cjs-2', 'cjs-3', 'cjs-4']);
    expect(esm).toIncludeAllMembers(['esm-1', 'esm-2', 'esm-3', 'esm-4']);
  });

  it('classifies CJS+ESM dual packages as ESM', () => {
    expect.hasAssertions();

    const { esm } = determineModuleTypes();

    expect(esm).toIncludeAllMembers([
      'dual-cjs-esm-1',
      'dual-cjs-esm-2',
      'dual-cjs-esm-3'
    ]);
  });

  it('deals with scoped packages', () => {
    expect.hasAssertions();

    const { esm } = determineModuleTypes();

    expect(esm).toIncludeAllMembers([
      '@namespace/dual-cjs-esm-4',
      '@namespace/dual-cjs-esm-5'
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

    expect(determineModuleTypes().cjs).toBe(determineModuleTypes().cjs);
    expect(determineModuleTypes().esm).toBe(determineModuleTypes().esm);
  });

  it('ignores foreign files in node_modules directory', () => {
    expect.hasAssertions();
    process.chdir(joinPath(pathToBadNodeModules, 'bad-4'));

    // ? Does not throw
    expect(() => determineModuleTypes()).not.toThrow();
  });

  it('upward root mode: coalesces local and upward node_modules', () => {
    expect.hasAssertions();

    process.chdir(monorepo1Dir);
    const { cjs, esm } = determineModuleTypes({ rootMode: 'upward' });

    expect(cjs).toIncludeSameMembers([
      'cjs-1',
      'cjs-2',
      'cjs-3',
      'cjs-4',
      'cjs-5',
      '@namespace/dual-cjs-esm-5'
    ]);

    expect(esm).toIncludeSameMembers([
      'esm-1',
      'esm-2',
      'esm-3',
      'esm-4',
      'esm-5',
      'dual-cjs-esm-1',
      'dual-cjs-esm-2',
      'dual-cjs-esm-3',
      'dual-cjs-esm-6',
      '@namespace/dual-cjs-esm-4'
    ]);
  });

  it('upward root mode: local node_modules overrides root node_modules', () => {
    expect.hasAssertions();

    process.chdir(monorepo1Dir);
    const { cjs, esm } = determineModuleTypes({ rootMode: 'upward' });

    expect(cjs).toContain('@namespace/dual-cjs-esm-5');
    expect(Array.from(new Set(cjs))).toStrictEqual(cjs);
    expect(esm).not.toContain('@namespace/dual-cjs-esm-5');
  });

  it('upward root mode: errors if no upward node_modules found #1', () => {
    expect.hasAssertions();

    mockedDirname.mockImplementationOnce(() => {
      const e = new Error('fake ENOENT') as Error & { code: string };
      e.code = 'ENOENT';
      throw e;
    });

    mockedDirname.mockImplementationOnce(() => pathActual.sep);

    process.chdir(monorepo1Dir);
    expect(() => determineModuleTypes({ rootMode: 'upward' })).toThrow(
      /failed to find node_modules/
    );
  });

  it('upward root mode: errors if upward no node_modules found #2', () => {
    expect.hasAssertions();

    mockedDirname.mockImplementationOnce(() => {
      const e = new Error('fake ENOENT') as Error & { code: string };
      e.code = 'ENOENT';
      throw e;
    });

    mockedDirname.mockImplementationOnce(() => '');

    process.chdir(monorepo1Dir);
    expect(() => determineModuleTypes({ rootMode: 'upward' })).toThrow(
      /failed to find node_modules/
    );
  });

  it('upward root mode: ignores ENOENT errors for non-existent local node_modules', () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    const { cjs, esm } = determineModuleTypes({ rootMode: 'upward' });

    expect(cjs).toIncludeAllMembers(['cjs-1', 'cjs-2', 'cjs-3', 'cjs-4']);
    expect(esm).toIncludeAllMembers(['esm-1', 'esm-2', 'esm-3', 'esm-4']);
  });

  it('upward root mode: re-throws non-ENOENT errors when looking for upward node_modules', () => {
    expect.hasAssertions();

    mockedDirname.mockImplementationOnce(() => {
      throw new Error('badbadnotgood');
    });

    process.chdir(monorepo1Dir);
    expect(() => determineModuleTypes({ rootMode: 'upward' })).toThrow(/badbadnotgood/);
  });

  it('upward root mode: re-throws deep non-ENOENT errors when looking for upward node_modules', () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    mockedDirname.mockImplementationOnce(pathActual.dirname);
    mockedDirname.mockImplementationOnce(() => {
      throw new Error('right error');
    });

    expect(() => determineModuleTypes({ rootMode: 'upward' })).toThrow(/right error/);
  });

  it('upward root mode: re-throws non-ENOENT errors when looking for local node_modules (upward)', () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    mockedDirname.mockImplementationOnce(() => {
      throw new Error('wrong error');
    });

    mockedJoin.mockImplementationOnce(() => {
      throw new Error('right error');
    });

    expect(() => determineModuleTypes({ rootMode: 'upward' })).toThrow(/right error/);
  });

  it('upward root mode: rootMode accepts path to relative node_modules with highest precedence', () => {
    expect.hasAssertions();
    process.chdir(`${monorepo1Dir}/../..`);

    const { cjs, esm } = determineModuleTypes({
      rootMode: './packages/fake-pkg/node_modules'
    });

    expect(cjs).toIncludeSameMembers([
      'cjs-1',
      'cjs-2',
      'cjs-3',
      'cjs-4',
      'cjs-5',
      '@namespace/dual-cjs-esm-5'
    ]);

    expect(esm).toIncludeSameMembers([
      'esm-1',
      'esm-2',
      'esm-3',
      'esm-4',
      'esm-5',
      'dual-cjs-esm-1',
      'dual-cjs-esm-2',
      'dual-cjs-esm-3',
      'dual-cjs-esm-6',
      '@namespace/dual-cjs-esm-4'
    ]);
  });

  it('upward root mode: throws on non-existent local node_modules if rootMode given relative node_modules', () => {
    expect.hasAssertions();
    process.chdir(polyrepo2Dir);

    expect(() =>
      determineModuleTypes({
        rootMode: '../monorepo-2/node_modules'
      })
    ).toThrow(/failed to find local node_modules/);
  });

  it('upward root mode: ignores ENOENT errors for non-existent relative node_modules', () => {
    expect.hasAssertions();
    process.chdir(monorepo1Dir);

    const { cjs, esm } = determineModuleTypes({ rootMode: './fake/path' });

    expect(cjs).toIncludeAllMembers(['cjs-5', '@namespace/dual-cjs-esm-5']);
    expect(esm).toIncludeAllMembers(['esm-5', 'dual-cjs-esm-6']);
  });

  it('upward root mode: re-throws non-ENOENT errors when looking for local node_modules (relative)', () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    mockedJoin.mockImplementationOnce(() => {
      throw new Error('left error');
    });

    expect(() => determineModuleTypes({ rootMode: './fake/path' })).toThrow(/left error/);
  });

  it('upward root mode: throws on invalid rootMode value', () => {
    expect.hasAssertions();

    expect(() => determineModuleTypes({ rootMode: 'bad' })).toThrow(
      /invalid rootMode option/
    );
  });
});
