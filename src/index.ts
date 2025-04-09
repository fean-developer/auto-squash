#!/usr/bin/env node
import { Command } from 'commander';
import { AutoSquash } from './commons/auto-squash';
import { parseOptions } from './options';

new Command();
const options = parseOptions();
// 

const squash = new AutoSquash(options);

squash.run();
