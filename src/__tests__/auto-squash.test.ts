import { AutoSquash } from '../commons/auto-squash';
import simpleGit from 'simple-git';

// __tests__/auto-squash.test.ts
jest.mock('simple-git');

const mockedSimpleGit = simpleGit as jest.Mock;

describe('AutoSquash', () => {
  let mockGit: any;

  beforeEach(() => {
    jest.resetModules();
    mockGit = {
      reset: jest.fn(),
      add: jest.fn(),
      commit: jest.fn(),
      branch: jest.fn(),
      raw: jest.fn(),
    };

    mockedSimpleGit.mockReturnValue(mockGit);
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Silencia logs no teste
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir mensagem quando houver menos de 2 commits', async () => {
    mockGit.branch.mockResolvedValue({ current: 'main' });

    mockGit.raw
      .mockResolvedValueOnce('abc123') // merge-base
      .mockResolvedValueOnce('abc123\n'); // rev-list com apenas um commit


    let options = {
      baseBranch: 'main',
      commitMessage: 'feat: squash',
      count: 1,
      force: false,
    };
    const autoSquash = new AutoSquash(options);
    await autoSquash.run();


    expect(console.log).toHaveBeenCalledWith('Nada a ser squashado: menos de 2 commits após a base.');
  });

  it('deve fazer squash de commits limitados por count', async () => {
    mockGit.branch.mockResolvedValue({ current: 'feature' });

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
    expect(mockGit.commit).toHaveBeenCalledWith('feat: squash');
  });


  it('faz squash forçado com os 2 últimos commits', async () => {
    mockGit.branch.mockResolvedValue({ current: 'sandbox' });

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
    mockGit.branch.mockResolvedValue({ current: 'main' });
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

  it('deve lançar erro se ocorrer erro inesperado', async () => {
    mockGit.branch.mockRejectedValue(new Error('Erro inesperado'));

    const autoSquash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'erro',
    });

    await expect(autoSquash.run()).rejects.toThrow('Erro inesperado');
  });

  it('deve exibir mensagem quando não há commits para squashar', async () => {
    mockGit.branch.mockResolvedValue({ current: 'main' });
    mockGit.raw.mockResolvedValueOnce(''); // Nenhum commit encontrado

  
    let options = {
      baseBranch: 'main',
      commitMessage: 'feat: squash',
      count: 1,
      force: false,
    };
    const autoSquash = new AutoSquash(options);
    await autoSquash.run();


    expect(console.log).toHaveBeenCalledWith('Nada a ser squashado: nenhum commit encontrado.');
  });

  it('deve exibir mensagem quando não é possível identificar o commit base', async () => {
    mockGit.branch.mockResolvedValue({ current: 'main' });
    mockGit.raw.mockResolvedValueOnce(''); // Nenhum commit base encontrado

    const autoSquash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: erro base',
    });

    await autoSquash.run();

    expect(console.log).toHaveBeenCalledWith('Nada a ser squashado: nenhum commit encontrado.');
  });

  it('deve exibir erro quando branch atual não é identificado', async () => {
    mockGit.branch.mockResolvedValue({ current: null });

    const autoSquash = new AutoSquash({
      baseBranch: 'main',
      commitMessage: 'feat: erro branch',
    });

    await expect(autoSquash.run()).rejects.toThrow('Não foi possível identificar o branch atual.');
  });
});