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
      debugger
      const detectedBase = await this.detectBaseBranch(this.options.base);
      if (!detectedBase) {
        throw new Error('Nenhum branch base encontrado para comparação.');
      }
      const baseBranch = detectedBase;

      console.log(`📌 Branch atual: ${currentBranch}`);
      console.log(`🔎 Usando base: ${baseBranch}`);

      const mergeBase = await this.git.raw(['merge-base', currentBranch, baseBranch]).then(out => out.trim());

      // ✅ Usa --first-parent para garantir que estamos na linha principal da história
      const rawCommits = await this.git.raw(['rev-list', '--reverse', '--first-parent', `${mergeBase}..HEAD`]);
      const allCommits = rawCommits.trim().split('\n').filter(Boolean);

      let commits = this.options.count ? allCommits.slice(-this.options.count) : allCommits;

      if (commits.length < 2) {
        console.log('⚠️ Nada a squashar: menos de 2 commits.');
        return;
      }

      const mergeCommitsRaw = await this.git.raw(['rev-list', '--merges', `${mergeBase}..HEAD`]);
      const mergeCommits = mergeCommitsRaw.trim().split('\n').filter(Boolean);
      
      if (mergeCommits.length > 0) {
        const firstMergeCommit = mergeCommits[0];
        const mergeIndex = commits.indexOf(firstMergeCommit);
      
        if (mergeIndex !== -1) {
          commits = commits.slice(0, mergeIndex);
          console.log('❌ Commit de merge encontrado. Squash será feito até o commit anterior ao merge.');
          
          // Lançar a exceção aqui, caso um merge intermediário seja encontrado
          throw new Error('Não é possível fazer squash porque existem merges entre os commits selecionados.');
        }
      }

      if (commits.length < 2) {
        console.log('⚠️ Após considerar merges, restam menos de 2 commits para squash.');
        return;
      }

      console.log(`Fazendo squash de ${commits.length} commits:`);
      commits.forEach((c, i) => console.log(`${i + 1}. ${c}`));

      const firstCommit = commits[0];
      const candidateBaseHash = await this.git.raw(['rev-parse', `${firstCommit}^`]).then(out => out.trim());

      const baseCommitType = await this.git.show([candidateBaseHash, '--no-patch', '--pretty=%P']).then(out => out.trim());
      const isMergeBase = baseCommitType.split(' ').length > 1;

      const baseHash = isMergeBase
        ? await this.git.raw(['rev-list', '--parents', '-n', '1', firstCommit]).then(out => out.trim().split(' ')[1])
        : candidateBaseHash;

      console.log(`🔧 Resetando com --soft até o commit base: ${baseHash}`);
      await this.git.reset(['--soft', baseHash]);

      await this.git.commit(this.options.commitMessage);
      console.log(`✅ Novo commit criado com a mensagem: "${this.options.commitMessage}"`);

      if (this.options.force) {
        console.log(`🚀 Fazendo push forçado para ${currentBranch}...`);
        await this.git.push('origin', currentBranch, ['--force']);
        console.log('✅ Push forçado concluído.');
      }

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

  private async detectBaseBranch(base?: string): Promise<string | null> {
    const branches = await this.git.branchLocal();
    if (base) {
      const hasLocalBase = branches.all.includes(base);
      if (hasLocalBase) return base;
    }
    if (branches.all.includes('main')) return 'main';
    if (branches.all.includes('develop')) return 'develop';  // Nova opção para 'develop'

    const remotes = await this.git.getRemotes(true);
    if (base) {
      console.log(`Verificando se o branch remoto "${base}" existe...`);
      const hasOriginCustmBase = remotes.some(r => r.refs.fetch.includes(`origin/${base}`));
      if (hasOriginCustmBase) return `origin/${base}`;
    }
    const hasOriginMain = remotes.some(r => r.refs.fetch.includes('origin/main'));
    const hasOriginDevelop = remotes.some(r => r.refs.fetch.includes('origin/develop'));
    

    if (hasOriginMain) return 'origin/main';
    if (hasOriginDevelop) return 'origin/develop';  // Nova opção para 'origin/develop'


    return null;
  }
}
