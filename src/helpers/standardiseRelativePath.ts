export const standardiseRelativePath = (path: string): string =>
  path.startsWith('./') ? path.replace(/^\.\//, '') : path;
