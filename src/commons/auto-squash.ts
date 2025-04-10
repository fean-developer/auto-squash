import simpleGit, { SimpleGit } from 'simple-git';
import { AutoSquashOptions } from './interfaces/auto-squash-options';
import simpleGit, { SimpleGit } from 'simple-git';
import { AutoSquashOptions } from './types';

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
          rawOutput = await this.git.raw(['rev-list', '--reverse', 'HEAD']);
        }
        commits = (rawOutput || '').trim().split('\n').filter(Boolean);
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
        console.log(`🔧 Fazendo reset --soft até o commit base: ${newBaseHash}`);
      } catch (err: any) {
        const message = err.message || '';
        if (message.includes('unknown revision') || message.includes('ambiguous argument')) {
          console.warn('⚠️  Commit inicial detectado. Fazendo reset misto até', commitsToSquash[0]);
          newBaseHash = '';
        } else {
          throw err;
        }
      }

      console.log('Exibindo os commits squashados:');
      commitsToSquash.forEach((commit, index) => {
        console.log(`${index + 1}. ${commit}`);
      });

      if (newBaseHash) {
        await this.git.reset(['--soft', newBaseHash]);
      } else {
        await this.git.reset(['--mixed', commitsToSquash[0]]);
        await this.git.add('.');
      }

      await this.git.commit(this.options.commitMessage);
      console.log(`✅ Novo commit criado com a mensagem: "${this.options.commitMessage}"`);
      console.log('✅ Squash concluído com sucesso!');

      if (this.options.push) {
        try {
          await this.git.push('origin', currentBranch, ['--force']);
          console.log('✅ Push forçado realizado com sucesso!');
        } catch (err) {
          console.warn('⚠️  Não foi possível fazer push. Verifique se seu Git está autenticado com o GitHub.');
          console.warn('👉 Dica: use SSH ou configure um token de acesso pessoal (PAT).');
        }
      } else {
        console.log('ℹ️  Para enviar suas alterações, execute:');
        console.log(`   git push origin ${currentBranch} --force`);
      }

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

