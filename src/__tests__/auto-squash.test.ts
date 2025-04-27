import { AutoSquash } from '../commons/auto-squash';
import { AutoSquashOptions } from '../commons/interfaces/auto-squash-options';
import { simpleGit, SimpleGit } from 'simple-git';
import { createMockGit } from '../__mocks__/mockGit';

jest.mock('simple-git');

describe('AutoSquash', () => {
  let mockGit: ReturnType<typeof createMockGit>;
  let autoSquash: AutoSquash;

  beforeEach(() => {
    mockGit = createMockGit();
    (simpleGit as jest.Mock).mockReturnValue(mockGit);

    // Mock dos métodos básicos que SEMPRE são chamados
    mockGit.show.mockResolvedValue('parent-hash');
    mockGit.reset.mockResolvedValue('');
    mockGit.commit.mockResolvedValue('');
    mockGit.push.mockResolvedValue('');
    mockGit.branchLocal.mockResolvedValue({ all: [] });
  });

  it('deve fazer squash corretamente de múltiplos commits', async () => {
    const options: AutoSquashOptions = {
      count: 4,
      commitMessage: 'fix: Squashing commits',
    };
    autoSquash = new AutoSquash(options);
  
    mockGit.branch.mockResolvedValue({
      current: 'feature/test-branch',
      branches: {
        main: { name: 'main' },
        'feature/test-branch': { name: 'feature/test-branch' },
      },
    });
  
    mockGit.getRemotes.mockResolvedValue([
      { name: 'origin', refs: { fetch: 'origin/main', push: '' } },
    ]);
  
    mockGit.raw
      .mockResolvedValueOnce('merge-base-commit') // merge-base
      .mockResolvedValueOnce('commit1\ncommit2\ncommit3\ncommit4') // commits
      .mockResolvedValueOnce('') // merges (vazio)
      .mockResolvedValueOnce('parent-of-commit1-hash') // rev-parse do commit1^
      .mockResolvedValueOnce('parent-hash'); // resultado do show
  
    await autoSquash.run();
  
    expect(mockGit.raw).toHaveBeenNthCalledWith(1, [
      'merge-base',
      'feature/test-branch',
      'origin/main',
    ]);
    expect(mockGit.raw).toHaveBeenNthCalledWith(2, [
      'rev-list',
      '--reverse',
      '--first-parent',
      'merge-base-commit..HEAD',
    ]);
    expect(mockGit.raw).toHaveBeenNthCalledWith(3, [
      'rev-list',
      '--merges',
      'merge-base-commit..HEAD',
    ]);
    expect(mockGit.raw).toHaveBeenNthCalledWith(4, [
      'rev-parse',
      'commit1^',
    ]);
    expect(mockGit.show).toHaveBeenCalledWith([
      'parent-of-commit1-hash',
      '--no-patch',
      '--pretty=%P',
    ]);
    expect(mockGit.reset).toHaveBeenCalledTimes(1);
    expect(mockGit.commit).toHaveBeenCalledWith('fix: Squashing commits');
  });

  it('deve identificar e usar base branch corretamente', async () => {
    const options: AutoSquashOptions = {
      count: 2,
      commitMessage: 'feat: squash com base correta',
    };
    autoSquash = new AutoSquash(options);
  
    mockGit.branch.mockResolvedValue({
      current: 'feature/awesome',
      branches: {
        main: { name: 'main' },
        develop: { name: 'develop' },
        'feature/awesome': { name: 'feature/awesome' },
      },
    });
  
    mockGit.branchLocal.mockResolvedValue({
      current: 'feature/awesome',
      branches: {
        main: { name: 'main' },
        develop: { name: 'develop' },
        'feature/awesome': { name: 'feature/awesome' },
      },
      all: ['main', 'develop', 'feature/awesome'],
    });
  
    mockGit.getRemotes.mockResolvedValue([
      { name: 'origin', refs: { fetch: 'https://github.com/fulano/repositorio.git', push: '' } },
    ]);
  
    mockGit.raw
      .mockResolvedValueOnce('merge-base-commit')
      .mockResolvedValueOnce('commit1\ncommit2')
      .mockResolvedValueOnce('')
      .mockResolvedValueOnce('parent-of-commit1') // simulando rev-parse commit1^
      .mockResolvedValueOnce('hash-only'); // simulando show --pretty=%P (não é merge)
      
    await autoSquash.run();
  
    expect(mockGit.raw).toHaveBeenNthCalledWith(1, [
      'merge-base',
      'feature/awesome',
      'main', // ← esperado agora
    ]);
  });
  
  
  it('deve dar throw se houver merges intermediários', async () => {
    const options: AutoSquashOptions = {
      count: 3,
      commitMessage: 'chore: tentativa de squash com merge',
    };
    autoSquash = new AutoSquash(options);
  
    mockGit.branch.mockResolvedValue({
      current: 'feature/with-merge',
      branches: {
        main: { name: 'main' },
        'feature/with-merge': { name: 'feature/with-merge' },
      },
    });
  
    mockGit.getRemotes.mockResolvedValue([
      { name: 'origin', refs: { fetch: 'origin/main', push: '' } },
    ]);
  
    mockGit.raw
      .mockResolvedValueOnce('merge-base-commit') // 1 - merge-base
      .mockResolvedValueOnce('commit1\ncommit2\nmerge-commit\ncommit3') // 2 - commits
      .mockResolvedValueOnce('merge-commit') // 3 - merge commit encontrado (erro)
      .mockResolvedValueOnce('commit1-hash') // 4 - rev-parse commit1^
      .mockResolvedValueOnce('parent-hash'); // 5 - show para o primeiro commit
  
    // Chamando a função para capturar a execução de erro
    await expect(autoSquash.run()).rejects.toThrowError(
      new Error('Não é possível fazer squash porque existem merges entre os commits selecionados.')
    );
  });
  

  it('deve usar --force na opção de push se configurado', async () => {
    const options: AutoSquashOptions = {
      count: 2,
      commitMessage: 'feat: squash forçado',
      force: true,
    };
    autoSquash = new AutoSquash(options);
  
    mockGit.branch.mockResolvedValue({
      current: 'feature/force-push',
      branches: {
        main: { name: 'main' },
        'feature/force-push': { name: 'feature/force-push' },
      },
    });
  
    mockGit.getRemotes.mockResolvedValue([
      { name: 'origin', refs: { fetch: 'origin/main', push: '' } },
    ]);
  
    mockGit.raw
      .mockResolvedValueOnce('merge-base-commit') // merge-base
      .mockResolvedValueOnce('commit1\ncommit2') // commits
      .mockResolvedValueOnce(''); // merges (vazio)
  
    // Simula o retorno de um hash de commit para o comando rev-parse
    mockGit.raw.mockResolvedValueOnce('commit1-hash'); // mock do rev-parse
  
    await autoSquash.run();
  
    // Verifica se o --force foi usado no push
    expect(mockGit.push).toHaveBeenCalledWith('origin', 'feature/force-push', ['--force']);
  });
  
  
});
