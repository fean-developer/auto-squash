#!/usr/bin/env node
import { AutoSquash } from './commons/auto-squash';
import { parseOptions } from './options';


const options = parseOptions();

const squash = new AutoSquash({
  baseBranch: options.baseBranch,
  commitMessage: options.commitMessage,
  count: options.count,
  force: options.force,
});

squash.run();
