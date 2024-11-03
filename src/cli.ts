import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { handler } from './handler.ts';

export const cli = () => {
  // yargs does not provide a way to pass generic to type args.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const argv = yargs(hideBin(process.argv)) as Argv<{
    input: string;
    output?: string;
    verbose?: boolean;
  }>;

  void argv
    .command(
      'build <input> <output>',
      'Build .d.cts type files from .d.ts files to provide types for both esm and cjs outputs.',
      cmdYargs =>
        cmdYargs
          .positional('input', {
            demandOption: true,
            desc: 'The directory where the .d.ts files are located, relative to the project root',
            type: 'string',
          })
          .positional('output', {
            demandOption: false,
            desc: 'The directory where the .d.cts files should be output, relative to the project root',
            type: 'string',
          })
          .option('verbose', {
            desc: 'Whether to output verbose logs',
            type: 'boolean',
          }),
      handler,
    )
    .help()
    .parseAsync();
};
