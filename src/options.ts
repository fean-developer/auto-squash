import { Command } from 'commander';

export function parseOptions() {
  const program = new Command();

  program
    .option('-m, --commit-message <message>', 'Mensagem do commit squash', 'feat: squash automático')
    .option('-c, --count <number>', 'Número de commits a squashar', value => Number(value))
    .option('-f, --force', 'Forçar squash (ignora branch base)', false);

  program.parse(process.argv);
  const opts = program.opts();

  return {
    commitMessage: opts.commitMessage,
    count: opts.count,
    force: opts.force,
  };
}