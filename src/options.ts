import { Command } from 'commander';

export function parseOptions() {
  const program = new Command();
  program
    .name('auto-squash')
    .description('Squasha commits desde a base comum com a main')
    .option('-b, --base <branch>', 'Nome da branch base', 'main')
    .option('-m, --message <message>', 'Mensagem do commit squash', 'feat: squash automático')
    .option('-c, --count <number>', 'Quantidade de commits a fazer squash', (val) => parseInt(val, 10))
    .option('--force', 'Força o squash dos últimos commits ignorando a base', false);

  program.parse(process.argv);
  return program.opts();
}
