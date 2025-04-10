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
      const currentBranch = branchSummary.current;

      if (!currentBranch) {
        throw new Error('Não foi possível identificar o branch atual.');
      }

      const totalCommitsRaw = await this.git.raw(['rev-list', '--count', 'HEAD']);
      const totalCommits = parseInt(totalCommitsRaw?.trim(), 10);

      const count = this.options.count ?? totalCommits;
      

      // Coleta os últimos N commits (mais antigos primeiro)
      const rawOutput = await this.git.raw(['rev-list', '--reverse', 'HEAD', '-n', `${count}`]);
      const commits = rawOutput.trim().split('\n').filter(Boolean);

      if (commits.length < 2) {
        console.log('⚠️ Nada a squashar: menos de 2 commits.');
        return;
      }

      console.log(`Fazendo squash de ${commits.length} commits:`);
      commits.forEach((c, i) => console.log(`${i + 1}. ${c}`));

      let baseHash: string;

      try {
        baseHash = await this.git.raw(['rev-parse', `${commits[0]}^`]).then(out => out.trim());
      } catch {
        console.warn('⚠️ Commit inicial detectado. Fazendo reset misto até ele.');
        baseHash = commits[0];
      }

      console.log(`🔧 Resetando com --soft até o commit base: ${baseHash}`);
      await this.git.reset(['--soft', baseHash]);

      await this.git.commit(this.options.commitMessage);
      console.log(`✅ Novo commit criado com a mensagem: "${this.options.commitMessage}"`);
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