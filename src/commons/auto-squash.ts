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
        const mergeBaseHash = (await this.git.raw(['merge-base', this.options.baseBranch, currentBranch])).trim();
        const commits = (await this.git.raw(['rev-list', `${mergeBaseHash}..HEAD`])).trim().split('\n').filter(Boolean);
  
        if (commits.length < 2) {
          console.log('Nada a ser squashado: menos de 2 commits após a base.');
          return;
        }
  
        console.log(`Fazendo squash dos últimos ${commits.length} commits...`);
  
        await this.git.reset(['--soft', mergeBaseHash]);
        await this.git.commit(this.options.commitMessage);
  
        console.log('✅ Squash concluído com sucesso!');
      } catch (error: any) {
        console.error('Erro ao tentar fazer squash:', error.message);
        process.exit(1);
      }
    }
  }