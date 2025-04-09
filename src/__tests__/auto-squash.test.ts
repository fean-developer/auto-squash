import { AutoSquash } from '../commons/auto-squash'
import simpleGit from 'simple-git';

jest.mock('simple-git');
const mockedSimpleGit = simpleGit as jest.Mock;

describe('AutoSquash', () => {
  let mockGit: any;

  beforeEach(() => {
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
    expect(mockGit.commit).toHaveBeenCalledWith(["feat: squash"]);
  });
});
