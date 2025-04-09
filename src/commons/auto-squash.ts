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
          commits = (await this.git.raw(['rev-list', 'HEAD', '--max-count', String(this.options.count || 2)]))
            .trim().split('\n').filter(Boolean).reverse();
        } else {
          const mergeBaseHash = (await this.git.raw(['merge-base', this.options.baseBranch, currentBranch])).trim();
          commits = (await this.git.raw(['rev-list', `${mergeBaseHash}..HEAD`])).trim().split('\n').filter(Boolean);
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
        try {
          newBaseHash = (await this.git.raw(['rev-parse', `${commitsToSquash[0]}^`])).trim();
        } catch (err) {
          console.warn(`⚠️  Commit ${commitsToSquash[0]} não possui pai. Usando o hash diretamente.`);
          newBaseHash = commitsToSquash[0];
        }
  
        await this.git.reset(['--soft', newBaseHash]);
        await this.git.commit([this.options.commitMessage]);
  
        console.log('✅ Squash concluído com sucesso!');
      } catch (error: any) {
        console.error('Erro ao tentar fazer squash:', error.message);
        process.exit(1);
      }
    }
  }