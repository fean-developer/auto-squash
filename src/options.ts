import { Command } from 'commander';

export function parseOptions(argv: string[] = process.argv): {
  baseBranch: string;
  commitMessage: string;
  count?: number;
} {
  const program = new Command();

  program
    .option('-b, --base <branch>', 'Nome da branch base', 'main')
    .option('-m, --message <message>', 'Mensagem do commit squash', 'feat: squash automático')
    .option('-c, --count <number>', 'Quantidade de commits a fazer squash', (val) => parseInt(val, 10));

  program.parse(argv);

  const opts = program.opts();

  return {
    baseBranch: opts.base,
    commitMessage: opts.message,
    count: opts.count,
  };
}