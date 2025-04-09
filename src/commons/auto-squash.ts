import simpleGit, { SimpleGit } from 'simple-git';
import { AutoSquashOptions } from './interfaces/auto-squash-options';

export class AutoSquash {
  private git: SimpleGit;
  private options: AutoSquashOptions;

  constructor(options: AutoSquashOptions) {
    this.git = simpleGit();
    this.options = options;
  }

  async run(): Promise<void> {
    try {
      const currentBranch = (await this.git.branch()).current;
      let commits: string[] = [];

      if (this.options.force) {
        const rawOutput = await this.git.raw(['rev-list', 'HEAD', '--max-count', String(this.options.count || 2)]);
        commits = (rawOutput || '').trim().split('\n').filter(Boolean).reverse();
      } else {
        const mergeBaseHash = (await this.git.raw(['merge-base', this.options.baseBranch, currentBranch])).trim();
        const rawOutput = await this.git.raw(['rev-list', `${mergeBaseHash}..HEAD`]);
        commits = (rawOutput || '').trim().split('\n').filter(Boolean);
      }

      if (commits.length < 2) {
        console.log('Nada a ser squashado: menos de 2 commits após a base.');
        return;
      }

      const totalCommits = commits.length;
      let commitsToSquash = commits;

      if (this.options.count && this.options.count < totalCommits) {
        commitsToSquash = commits.slice(-this.options.count);
        console.log(`Fazendo squash dos últimos ${commitsToSquash.length} commits.`);
      } else {
        console.log(`Fazendo squash de todos os ${totalCommits} commits.`);
      }

      let newBaseHash = '';

      if (commitsToSquash[0]) {
        try {
          newBaseHash = (await this.git.raw(['rev-parse', `${commitsToSquash[0]}^`])).trim();
        } catch (err: any) {
          const message = err.message || '';
          if (message.includes('unknown revision') || message.includes('ambiguous argument')) {
            console.warn(`⚠️  O commit ${commitsToSquash[0]} não possui pai. Este é o commit inicial.`);
            newBaseHash = '';
          } else {
            throw err;
          }
        }
      }

      if (newBaseHash) {
        await this.git.reset(['--soft', newBaseHash]);
      } else {
        await this.git.reset(['--mixed', commitsToSquash[0]]);
        await this.git.add('.');
      }

      await this.git.commit(this.options.commitMessage);

      console.log('✅ Squash concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao tentar fazer squash:', error?.message);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      } else {
        throw error;
      }
    }
  }
}