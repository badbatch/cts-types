import { setVerbose, verboseLog } from '@repodog/cli-utils';
import colors from 'ansi-colors';
import { outputFileSync } from 'fs-extra/esm';
import { glob } from 'glob';
import { isError } from 'lodash-es';
import { readFileSync } from 'node:fs';
import { parse } from 'node:path';
import shelljs from 'shelljs';
import { standardiseRelativePath } from './helpers/standardiseRelativePath.ts';
import type { HandlerArgs } from './types.ts';

export const handler = ({ input, output, verbose = false }: HandlerArgs) => {
  setVerbose(verbose, 'cts-types');
  verboseLog(`Building cts types for: ${input}`);

  try {
    const standardisedInput = standardiseRelativePath(input);
    const files = glob.sync(`${standardisedInput}/**/*.d.ts`);
    verboseLog(`Files to convert:\n${files.join('\n')}`);

    for (const file of files) {
      verboseLog(`Converting: ${file}`);
      const { dir, name } = parse(file);
      const renamedFile = `${dir}/${name}.cts`;
      const outputFile = output ? renamedFile.replace(standardisedInput, standardiseRelativePath(output)) : renamedFile;
      const content = readFileSync(file, { encoding: 'utf8' });
      const updatedContent = content.replace(/\.ts/g, '.cts');
      verboseLog(`Outputing ${file} to: ${outputFile}`);
      outputFileSync(outputFile, updatedContent);
    }

    verboseLog(`Finished building cts types for: ${input}`);
    return shelljs.exit(0);
  } catch (error) {
    const confirmedError = isError(error) ? error : new Error('An unexpected error occured.');

    shelljs.echo(
      `${colors.magenta('cts-types')} ${colors.dim('=>')} ${colors.red(`Error: ${confirmedError.message}`)}`
    );

    return shelljs.exit(1);
  }
};
