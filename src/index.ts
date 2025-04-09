#!/usr/bin/env node
import { Command } from 'commander';
import { AutoSquash } from './commons/auto-squash';

const program = new Command();

program
  .name('auto-squash')
  .description('Squasha commits desde a base comum com a main')
  .option('-b, --base <branch>', 'Nome da branch base', 'main')
  .option('-m, --message <message>', 'Mensagem do commit squash', 'feat: squash automático');

program.parse(process.argv);

const options = program.opts();

const squash = new AutoSquash({
  baseBranch: options.base,
  commitMessage: options.message,
});

squash.run();
