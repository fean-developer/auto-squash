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
      const branchSummary = await this.git.branch();
      if (!branchSummary || !branchSummary.current) {
        throw new Error('Não foi possível identificar o branch atual.');
      }

      const currentBranch = branchSummary.current;
      let commits: string[] = [];

      const isSameBranch = this.options.baseBranch === currentBranch;
      const shouldForce = this.options.force || isSameBranch;

      if (shouldForce) {
        let rawOutput: string;
        if (this.options.count) {
          rawOutput = await this.git.raw(['rev-list', 'HEAD', '--max-count', String(this.options.count)]);
        } else {
          // Se a base for igual à branch atual e --count não for passado, pegamos tudo até o commit inicial
          rawOutput = await this.git.raw(['rev-list', '--reverse', 'HEAD']);
        }
        commits = (rawOutput || '').trim().split('\n').filter(Boolean);

        if (commits.length === 0) {
          console.log('Nada a ser squashado: nenhum commit encontrado.');
          return;
        }
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

      if (!commitsToSquash.length || !commitsToSquash[0]) {
        console.log('Não foi possível identificar o commit base para o squash.');
        return;
      }

      let newBaseHash = '';

      try {
        newBaseHash = (await this.git.raw(['rev-parse', `${commitsToSquash[0]}^`])).trim();
        console.log(`Novo commit criado com a mensagem: "${this.options.commitMessage}"`);
        console.log('Total de commits squashados:', commitsToSquash.length);
        console.log('Exibindo os commits squashados:');
        
        commitsToSquash.forEach(commit => console.log(commit));
      } catch (err: any) {
        const message = err.message || '';
        if (message.includes('unknown revision') || message.includes('ambiguous argument')) {
          console.warn(`⚠️  O commit ${commitsToSquash[0]} não possui pai. Este é o commit inicial.`);
          newBaseHash = '';
        } else {
          throw err;
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
