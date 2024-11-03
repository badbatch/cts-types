import { log, setVerbose, verboseLog } from '@repodog/cli-utils';
import colors from 'ansi-colors';
import { glob } from 'glob';
import { isError } from 'lodash-es';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';
import shelljs from 'shelljs';
import { standardiseRelativePath } from './helpers/standardiseRelativePath.ts';
import { type HandlerArgs } from './types.ts';

export const handler = ({ input, output, verbose = false }: HandlerArgs) => {
  setVerbose(verbose, 'cts-types');
  verboseLog('>>>> USER CONFIG START <<<<');
  verboseLog(`input: ${input}`);
  verboseLog(`output: ${output ?? 'None'}`);
  verboseLog('>>>> USER CONFIG END <<<<\n');
  log(`Building cts types for: ${input}`);

  try {
    const standardisedInput = standardiseRelativePath(input);
    verboseLog(`standardisedInput: ${standardisedInput}`);
    const files = glob.sync([`${standardisedInput}/**/*.d.ts`, `${standardisedInput}/**/*.d.ts.map`]);
    verboseLog(`Files to convert:${files.length > 0 ? `\n${files.join('\n')}` : ' None'}\n`);

    if (files.length === 0) {
      throw new Error('No files to convert. Please check the input is correct.');
    }

    for (const file of files) {
      verboseLog(`Converting: ${file}`);
      const { dir, ext, name } = parse(file);
      const renamedFile = ext === '.ts' ? `${dir}/${name}.cts` : `${dir}/${name.replace(/\.ts$/, '.cts')}.map`;
      verboseLog(`renamedFile: ${renamedFile}`);
      const outputFile = output ? renamedFile.replace(standardisedInput, standardiseRelativePath(output)) : renamedFile;
      verboseLog(`outputFile: ${outputFile}`);
      const content = readFileSync(file, { encoding: 'utf8' });
      const updatedContent = content.replaceAll('.ts', '.cts');
      verboseLog(`Outputing ${file} to: ${outputFile}\n`);
      const outputDir = resolve(process.cwd(), dirname(outputFile));

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(outputFile, updatedContent);
    }

    log(`Finished building cts types for: ${input}`);
    return shelljs.exit(0);
  } catch (error) {
    const confirmedError = isError(error) ? error : new Error('An unexpected error occured.');

    shelljs.echo(
      `${colors.magenta('cts-types')} ${colors.dim('=>')} ${colors.red(`Error: ${confirmedError.message}`)}`,
    );

    return shelljs.exit(1);
  }
};
