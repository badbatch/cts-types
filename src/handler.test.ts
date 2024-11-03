import { expect, jest } from '@jest/globals';
import { createFsFromVolume, vol } from 'memfs';
import { type SnapshotNode, toSnapshotSync } from 'memfs/lib/snapshot';

jest.unstable_mockModule('@repodog/cli-utils', () => ({
  log: jest.fn(),
  setVerbose: jest.fn(),
  verboseLog: jest.fn(),
}));

jest.unstable_mockModule('glob', () => ({
  glob: {
    sync: jest
      .fn()
      .mockReturnValue([
        'project/dist/types/types.d.ts.map',
        'project/dist/types/types.d.ts',
        'project/dist/types/index.d.ts.map',
        'project/dist/types/index.d.ts',
        'project/dist/types/handler.d.ts.map',
        'project/dist/types/handler.d.ts',
        'project/dist/types/helpers/buildEndpoint/index.d.ts',
        'project/dist/types/helpers/buildEndpoint/index.d.ts.map',
        'project/dist/types/helpers/standardiseRelativePath.d.ts',
        'project/dist/types/helpers/standardiseRelativePath.d.ts.map',
        'project/dist/types/cli.d.ts.map',
        'project/dist/types/cli.d.ts',
      ]),
  },
}));

jest.unstable_mockModule('node:fs', () => createFsFromVolume(vol));

jest.unstable_mockModule('shelljs', () => ({
  default: {
    echo: jest.fn(),
    exit: jest.fn(),
  },
}));

process.cwd = () => '/';

const mockFileSystem = (overrides: Record<string, string> = {}) => {
  const base = {
    './dist/types/cli.d.ts': '//# sourceMappingURL=cli.d.ts.map',
    './dist/types/cli.d.ts.map': '{"version":3,"file":"cli.d.ts"}',
    './dist/types/handler.d.ts': '//# sourceMappingURL=handler.d.ts.map',
    './dist/types/handler.d.ts.map': '{"version":3,"file":"handler.d.ts"}',
    './dist/types/helpers/buildEndpoint/index.d.ts': '//# sourceMappingURL=index.d.ts.map',
    './dist/types/helpers/buildEndpoint/index.d.ts.map': '{"version":3,"file":"index.d.ts"}',
    './dist/types/helpers/standardiseRelativePath.d.ts': '//# sourceMappingURL=standardiseRelativePath.d.ts.map',
    './dist/types/helpers/standardiseRelativePath.d.ts.map': '{"version":3,"file":"standardiseRelativePath.d.ts"}',
    './dist/types/index.d.ts': '//# sourceMappingURL=index.d.ts.map',
    './dist/types/index.d.ts.map': '{"version":3,"file":"index.d.ts"}',
    './dist/types/types.d.ts': '//# sourceMappingURL=types.d.ts.map',
    './dist/types/types.d.ts.map': '{"version":3,"file":"types.d.ts"}',
  };

  vol.fromJSON({ ...base, ...overrides }, '/project');
};

const resetFileSystem = () => {
  vol.reset();
};

const getSimplifiedSnapshotFileTree = () => {
  const snapshot = toSnapshotSync({ fs: vol, path: 'project' });
  type SimplifiedSnapshotFileTree = { [key: string]: string | SimplifiedSnapshotFileTree };

  const parseSnapshot = (snap: SnapshotNode): string | SimplifiedSnapshotFileTree => {
    if (!snap) {
      return {};
    }

    const [type] = snap;
    let tree: string | SimplifiedSnapshotFileTree = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (type === 0) {
      const entries = snap[2];

      for (const name in entries) {
        const entry = entries[name];

        if (!entry) {
          continue;
        }

        tree[name] = parseSnapshot(entries[name]!);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    } else if (type === 1) {
      tree = new TextDecoder().decode(snap[2]);
    }

    return tree;
  };

  return parseSnapshot(snapshot);
};

const input = 'project/dist/types';

describe('handler', () => {
  beforeEach(() => {
    mockFileSystem();
  });

  afterEach(() => {
    resetFileSystem();
    jest.clearAllMocks();
  });

  describe('when there are no files to convert', () => {
    let shelljs: jest.Mocked<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      const { glob } = jest.mocked(await import('glob'));
      glob.sync.mockReturnValueOnce([]);
    });

    it('should throw an error', async () => {
      const { handler } = await import('./handler.ts');
      handler({ input });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining('No files to convert. Please check the input is correct'),
      );
    });

    it('should exit with a code of 1', async () => {
      const { handler } = await import('./handler.ts');
      handler({ input });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when there are files to convert', () => {
    describe('when no output dir is provided', () => {
      let shelljs: jest.Mocked<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
      });

      it('should write the files to the input directory', async () => {
        const { handler } = await import('./handler.ts');
        handler({ input });
        expect(getSimplifiedSnapshotFileTree()).toMatchSnapshot();
      });

      it('should exit with a code of 0', async () => {
        const { handler } = await import('./handler.ts');
        handler({ input });
        expect(shelljs.exit).toHaveBeenCalledWith(0);
      });
    });

    describe('when output dir is provided', () => {
      let shelljs: jest.Mocked<typeof import('shelljs')>;
      const output = 'project/dist/types/cjs';

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
      });

      it('should write the files to the output directory', async () => {
        const { handler } = await import('./handler.ts');
        handler({ input, output });
        expect(getSimplifiedSnapshotFileTree()).toMatchSnapshot();
      });

      it('should exit with a code of 0', async () => {
        const { handler } = await import('./handler.ts');
        handler({ input, output });
        expect(shelljs.exit).toHaveBeenCalledWith(0);
      });
    });
  });
});
