import yargs from 'yargs';
import { handler } from './handler.ts';

export const cli = () => {
  yargs
    .command(
      'build <input> <output>',
      'Write config from a config builder',
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
      handler
    )
    .help().argv;
};
