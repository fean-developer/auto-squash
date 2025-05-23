#!/usr/bin/env node
import { AutoSquash } from './commons/auto-squash';
import { parseOptions } from './options';


const options = parseOptions();

const squash = new AutoSquash({
  commitMessage: options.commitMessage,
  base: options.base,
  count: options.count,
  force: options.force,
});

squash.run();
