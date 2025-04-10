import simpleGit from 'simple-git';
import { AutoSquash } from '../commons/auto-squash';
import { AutoSquashOptions } from '../commons/interfaces/auto-squash-options';

jest.mock('simple-git');

describe('AutoSquash', () => {
  let mockGit: any;
  let autoSquash: AutoSquash;

  beforeEach(() => {
    mockGit = {
      branch: jest.fn(),
      raw: jest.fn(),
      reset: jest.fn(),
      commit: jest.fn(),
    };
    (simpleGit as jest.Mock).mockReturnValue(mockGit);

    const options: AutoSquashOptions = {
      count: 4,
      commitMessage: 'fix: Squashing commits',
    };
    autoSquash = new AutoSquash(options);
  });

  it('deve fazer squash corretamente de múltiplos commits', async () => {
    mockGit.branch.mockResolvedValue({ current: 'feature/test-branch' });
    mockGit.raw
      .mockResolvedValueOnce('4') // Número de commits
      .mockResolvedValueOnce('commit4\ncommit3\ncommit2\ncommit1') // Lista de commits
      .mockResolvedValueOnce('parentCommit'); // Commit pai do primeiro commit
    mockGit.reset.mockResolvedValue(undefined);
    mockGit.commit.mockResolvedValue(undefined);
  
    await autoSquash.run();
  
    expect(mockGit.branch).toHaveBeenCalled();
    expect(mockGit.raw).toHaveBeenNthCalledWith(1, ['rev-list', '--count', 'HEAD']);
    expect(mockGit.raw).toHaveBeenNthCalledWith(2, ['rev-list', '--reverse', 'HEAD', '-n', '4']);
    expect(mockGit.raw).toHaveBeenNthCalledWith(3, ['rev-parse', 'commit4^']);
    expect(mockGit.reset).toHaveBeenCalledWith(['--soft', 'parentCommit']);
    expect(mockGit.commit).toHaveBeenCalledWith('fix: Squashing commits');
  });



  it('deve lançar erro se o branch atual não puder ser identificado', async () => {
    mockGit.branch.mockResolvedValue({ current: null });

    await expect(autoSquash.run()).rejects.toThrow('Não foi possível identificar o branch atual.');
  });

  it('deve lidar com erro ao tentar fazer squash', async () => {
    mockGit.branch.mockResolvedValue({ current: 'feature/test-branch' });
    mockGit.raw.mockRejectedValue(new Error('Erro ao executar comando git'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(autoSquash.run()).rejects.toThrow('Erro ao executar comando git');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao tentar fazer squash:', 'Erro ao executar comando git');

    consoleErrorSpy.mockRestore();
  });
});