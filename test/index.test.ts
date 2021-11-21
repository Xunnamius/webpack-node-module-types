import { determineModuleTypes, clearCache } from '../src/index';
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

describe('[ASYNC API] webpack-node-module-types', () => {
  it('differentiates CJS and ESM packages', async () => {
    expect.hasAssertions();

    const { cjs, esm } = await determineModuleTypes();

    expect(cjs).toIncludeAllMembers(['cjs-1', 'cjs-2', 'cjs-3', 'cjs-4']);
    expect(esm).toIncludeAllMembers(['esm-1', 'esm-2', 'esm-3', 'esm-4']);
  });

  it('classifies CJS+ESM dual packages as ESM', async () => {
    expect.hasAssertions();

    const { esm } = await determineModuleTypes();

    expect(esm).toIncludeAllMembers([
      'dual-cjs-esm-1',
      'dual-cjs-esm-2',
      'dual-cjs-esm-3'
    ]);
  });

  it('deals with scoped packages', async () => {
    expect.hasAssertions();

    const { esm } = await determineModuleTypes();

    expect(esm).toIncludeAllMembers([
      '@namespace/dual-cjs-esm-4',
      '@namespace/dual-cjs-esm-5'
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

    expect((await determineModuleTypes()).cjs).toBe((await determineModuleTypes()).cjs);
    expect((await determineModuleTypes()).esm).toBe((await determineModuleTypes()).esm);
  });

  it('ignores foreign files in node_modules directory', async () => {
    expect.hasAssertions();
    process.chdir(joinPath(pathToBadNodeModules, 'bad-4'));

    // ? Does not throw
    await expect(determineModuleTypes()).toResolve();
  });

  it('upward root mode: coalesces local and upward node_modules', async () => {
    expect.hasAssertions();

    process.chdir(monorepo1Dir);
    const { cjs, esm } = await determineModuleTypes({ rootMode: 'upward' });

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

  it('upward root mode: local node_modules overrides root node_modules', async () => {
    expect.hasAssertions();

    process.chdir(monorepo1Dir);
    const { cjs, esm } = await determineModuleTypes({ rootMode: 'upward' });

    expect(cjs).toContain('@namespace/dual-cjs-esm-5');
    expect(Array.from(new Set(cjs))).toStrictEqual(cjs);
    expect(esm).not.toContain('@namespace/dual-cjs-esm-5');
  });

  it('upward root mode: errors if no upward node_modules found #1', async () => {
    expect.hasAssertions();

    mockedDirname.mockImplementationOnce(() => {
      const e = new Error('fake ENOENT') as Error & { code: string };
      e.code = 'ENOENT';
      throw e;
    });

    mockedDirname.mockImplementationOnce(() => pathActual.sep);

    process.chdir(monorepo1Dir);
    await expect(determineModuleTypes({ rootMode: 'upward' })).rejects.toMatchObject({
      message: expect.stringContaining('failed to find node_modules')
    });
  });

  it('upward root mode: errors if upward no node_modules found #2', async () => {
    expect.hasAssertions();

    mockedDirname.mockImplementationOnce(() => {
      const e = new Error('fake ENOENT') as Error & { code: string };
      e.code = 'ENOENT';
      throw e;
    });

    mockedDirname.mockImplementationOnce(() => '');

    process.chdir(monorepo1Dir);
    await expect(determineModuleTypes({ rootMode: 'upward' })).rejects.toMatchObject({
      message: expect.stringContaining('failed to find node_modules')
    });
  });

  it('upward root mode: ignores ENOENT errors for non-existent local node_modules', async () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    let cjs, esm;

    await expect(
      (async () => ({ cjs, esm } = await determineModuleTypes({ rootMode: 'upward' })))()
    ).toResolve();

    expect(cjs).toIncludeAllMembers(['cjs-1', 'cjs-2', 'cjs-3', 'cjs-4']);
    expect(esm).toIncludeAllMembers(['esm-1', 'esm-2', 'esm-3', 'esm-4']);
  });

  it('upward root mode: re-throws non-ENOENT errors when looking for upward node_modules', async () => {
    expect.hasAssertions();

    mockedDirname.mockImplementationOnce(() => {
      throw new Error('badbadnotgood');
    });

    process.chdir(monorepo1Dir);
    await expect(determineModuleTypes({ rootMode: 'upward' })).rejects.toMatchObject({
      message: 'badbadnotgood'
    });
  });

  it('upward root mode: re-throws deep non-ENOENT errors when looking for upward node_modules', async () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    mockedDirname.mockImplementationOnce(pathActual.dirname);
    mockedDirname.mockImplementationOnce(() => {
      throw new Error('right error');
    });

    await expect(determineModuleTypes({ rootMode: 'upward' })).rejects.toMatchObject({
      message: 'right error'
    });
  });

  it('upward root mode: re-throws non-ENOENT errors when looking for local node_modules (upward)', async () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    mockedDirname.mockImplementationOnce(() => {
      throw new Error('wrong error');
    });

    mockedJoin.mockImplementationOnce(() => {
      throw new Error('right error');
    });

    await expect(determineModuleTypes({ rootMode: 'upward' })).rejects.toMatchObject({
      message: 'right error'
    });
  });

  it('upward root mode: rootMode accepts path to relative node_modules with highest precedence', async () => {
    expect.hasAssertions();
    process.chdir(`${monorepo1Dir}/../..`);

    const { cjs, esm } = await determineModuleTypes({
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

  it('upward root mode: throws on non-existent local node_modules if rootMode given relative node_modules', async () => {
    expect.hasAssertions();
    process.chdir(polyrepo2Dir);

    await expect(
      determineModuleTypes({
        rootMode: '../monorepo-2/node_modules'
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('failed to find local node_modules')
    });
  });

  it('upward root mode: ignores ENOENT errors for non-existent relative node_modules', async () => {
    expect.hasAssertions();
    process.chdir(monorepo1Dir);

    let cjs, esm;

    await expect(
      (async () =>
        ({ cjs, esm } = await determineModuleTypes({ rootMode: './fake/path' })))()
    ).toResolve();

    expect(cjs).toIncludeAllMembers(['cjs-5', '@namespace/dual-cjs-esm-5']);
    expect(esm).toIncludeAllMembers(['esm-5', 'dual-cjs-esm-6']);
  });

  it('upward root mode: re-throws non-ENOENT errors when looking for local node_modules (relative)', async () => {
    expect.hasAssertions();
    process.chdir(monorepo2Dir);

    mockedJoin.mockImplementationOnce(() => {
      throw new Error('right error');
    });

    await expect(determineModuleTypes({ rootMode: './fake/path' })).rejects.toMatchObject(
      {
        message: 'right error'
      }
    );
  });

  it('upward root mode: throws on invalid rootMode value', async () => {
    expect.hasAssertions();

    await expect(determineModuleTypes({ rootMode: 'bad' })).rejects.toMatchObject({
      message: expect.stringContaining('invalid rootMode option')
    });
  });
});
