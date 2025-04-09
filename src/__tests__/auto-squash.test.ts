import { AutoSquash } from '../commons/auto-squash'
jest.mock('simple-git');
import simpleGit from 'simple-git';

const mockedSimpleGit = simpleGit as jest.Mock;

describe('AutoSquash', () => {
  let mockGit: any;

  beforeEach(() => {
    jest.resetModules(); // Importante para limpar mocks anteriores
    mockGit = {
      branch: jest.fn().mockResolvedValue({ current: 'feature' }),
      raw: jest.fn(),
      reset: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    mockedSimpleGit.mockReturnValue(mockGit);
  });

  it('deve exibir mensagem quando houver menos de 2 commits', async () => {
    mockGit.raw
      .mockResolvedValueOnce('abc123') // merge-base
      .mockResolvedValueOnce('abc123\n'); // rev-list com apenas um commit

    const squash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: squash',
    });

    console.log = jest.fn(); // evitar logs reais

    await squash.run();

    expect(console.log).toHaveBeenCalledWith('Nada a ser squashado: menos de 2 commits após a base.');
  });

  it('deve fazer squash de commits limitados por count', async () => {
    mockGit.raw
      .mockResolvedValueOnce('abc123') // merge-base
      .mockResolvedValueOnce('abc123\nabc456\nabc789') // rev-list
      .mockResolvedValueOnce('abc456'); // rev-parse do commit base

    const squash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: squash',
      count: 2,
    });

    await squash.run();

    expect(mockGit.reset).toHaveBeenCalledWith(['--soft', 'abc456']);
    expect(mockGit.commit).toHaveBeenCalledWith("feat: squash");
  });

  xit('faz squash com commit inicial (sem pai)', async () => {
    const mockGit = {
      branch: jest.fn().mockResolvedValue({ current: 'main' }),
      raw: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve('abc123\n')) // rev-list HEAD
        .mockImplementationOnce(() => {
          const error = new Error('fatal: ambiguous argument "abc123^": unknown revision');
          (error as any).message = error.message;
          throw error;
        }),
      reset: jest.fn(),
      add: jest.fn(),
      commit: jest.fn(),
    };

    mockedSimpleGit.mockReturnValue(mockGit);

    const { AutoSquash } = await import('../commons/auto-squash');

    const autoSquash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: squashando commit inicial',
      force: true,
      count: 1,
    });

    await autoSquash.run();

    expect(mockGit.reset).toHaveBeenCalledWith(['--mixed', 'abc123']);
    expect(mockGit.add).toHaveBeenCalledWith('.');
    expect(mockGit.commit).toHaveBeenCalledWith('feat: squashando commit inicial');
  });


  it('faz squash forçado com os 2 últimos commits', async () => {
    mockGit.branch.mockResolvedValue({ current: 'sandbox' } as any);
  
    mockGit.raw.mockImplementation(async (args: any) => {
      if (args.includes('rev-list')) return 'abc1\nabc2\nabc3';
      if (args.includes('rev-parse')) return 'parent-hash';
      return '';
    });
  
    const autoSquash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: squash forçado',
      count: 2,
      force: true,
    });
  
    await autoSquash.run();
  
    expect(mockGit.reset).toHaveBeenCalledWith(['--soft', 'parent-hash']);
    expect(mockGit.commit).toHaveBeenCalledWith('feat: squash forçado');
  });

  it('não faz squash se houver apenas 1 commit após a base', async () => {
    mockGit.branch.mockResolvedValue({ current: 'main' } as any);
    mockGit.raw.mockImplementation(async (args: any) => {
      if (args.includes('merge-base')) return 'base123';
      if (args.includes('rev-list')) return 'abc123';
      return '';
    });
  
    const autoSquash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: tentativa',
    });
  
    await autoSquash.run();
  
    expect(mockGit.commit).not.toHaveBeenCalled();
  });
});
