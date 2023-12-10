export const standardiseRelativePath = (path: string) => (path.startsWith('./') ? path.replace(/^\.\//, '') : path);
