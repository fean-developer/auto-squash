import { parseOptions } from '../options';

const mockArgv = process.argv;

describe('Parâmetros da CLI', () => {
  afterEach(() => {
    process.argv = mockArgv;
  });

  it('deve utilizar os valores padrão quando nenhum argumento é fornecido', () => {
    process.argv = ['node', 'auto-squash'];
    const opts = parseOptions();

    expect(opts.baseBranch).toBe('main');
    expect(opts.commitMessage).toBe('feat: squash automático');
    expect(opts.count).toBeUndefined();
  });

  it('deve aceitar valores customizados', () => {
    process.argv = ['node', 'auto-squash', '--base', 'develop', '--message', 'custom msg', '--count', '5'];
    const opts = parseOptions();

    expect(opts.baseBranch).toBe('develop');
    expect(opts.commitMessage).toBe('custom msg');
    expect(opts.count).toBe(5);
  });

  it('deve interpretar corretamente o parâmetro --count como número', () => {
    process.argv = ['node', 'auto-squash', '--count', '10'];
    const opts = parseOptions();

    expect(opts.count).toBe(10);
    expect(typeof opts.count).toBe('number');
  });

  it('deve interpretar corretamente o parâmetro --base', () => {
    process.argv = ['node', 'auto-squash', '--base', 'release'];
    const opts = parseOptions();

    expect(opts.baseBranch).toBe('release');
  });
});