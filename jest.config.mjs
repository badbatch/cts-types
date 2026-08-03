import jestConfig from '@repodog/jest-config';
import swcConfig from '@repodog/swc-config';

const config = jestConfig({ compilerOptions: swcConfig });

// Required for Jest
// eslint-disable-next-line import-x/no-default-export
export default {
  ...config,
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, '<rootDir>/jest.setup.mjs'],
};
