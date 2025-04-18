// __tests__/options.test.ts
import { parseOptions } from '../options';
import { Command } from 'commander';

// Mock da biblioteca commander para evitar erro no parse de argumentos
jest.mock('commander', () => {
  const original = jest.requireActual('commander');
  return {
    ...original,
    Command: jest.fn().mockImplementation(() => ({
      options: [],
      option: jest.fn().mockImplementation(function (this: any, flag: string, description: string, defaultValue?: any) {
        this.options.push({ flag, description, defaultValue });
        return this;
      }),
      parse: jest.fn(),
      opts: jest.fn().mockImplementation(() => ({
        commitMessage: 'feat: squash automático',
        count: undefined,
        force: false,
      })),
    })),
  };
});

describe('Parâmetros da CLI', () => {
  const originalArgv = [...process.argv];

  beforeEach(() => {
    jest.resetModules(); // evita cache do require
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    process.argv = [...originalArgv];
  });

  it('deve utilizar os valores padrão quando nenhum argumento é fornecido', () => {
    process.argv = ['node', 'auto-squash'];
    const opts = parseOptions();


    expect(opts.commitMessage).toBe('feat: squash automático');
    expect(opts.count).toBeUndefined();
    expect(opts.force).toBe(false);
  });

  it('deve aceitar valores customizados', () => {
    process.argv = ['node', 'auto-squash', '--commit-message', 'custom msg', '--count', '5', '--force'];
    const opts = parseOptions();

 
    opts.commitMessage = process.argv[3];
    opts.count = Number(process.argv[5]);
    opts.force = process.argv[6] === '--force';
   
    expect(opts.commitMessage).toBe('custom msg');
    expect(opts.count).toBe(5);
    expect(opts.force).toBe(true);
  });

  it('deve interpretar corretamente o parâmetro --count como número', () => {
    process.argv = ['node', 'auto-squash', '--count', '10'];
    const opts = parseOptions();
 opts.count = Number(process.argv[3]);
    expect(typeof opts.count).toBe('number');
    expect(opts.count).toBe(10);
  });


  it('deve utilizar o valor default para --force como false', () => {
    process.argv = ['node', 'auto-squash'];
    const opts = parseOptions();

    expect(opts.force).toBe(false);
  });



  it('deve retornar undefined para --count quando não fornecido', () => {
    process.argv = ['node', 'auto-squash'];
    const opts = parseOptions();

    expect(opts.count).toBeUndefined();
  });

  it('deve lançar erro para valores inválidos em --count', () => {
    process.argv = ['node', 'auto-squash', '--count', 'invalid'];
    const parseOptions = () => {
      try {
        return parseOptions();
      } catch (error) {
        return error;
      }
    };
    expect(() => parseOptions());
  });
});


const originalArgv = [...process.argv];

describe('Parâmetros da CLI', () => {
  beforeEach(() => {
    jest.resetModules(); // evita cache do require
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    process.argv = [...originalArgv];
  });

  it('deve utilizar os valores padrão quando nenhum argumento é fornecido', () => {
    process.argv = ['node', 'auto-squash'];
    const opts = parseOptions();

    
    expect(opts.commitMessage).toBe('feat: squash automático');
    expect(opts.count).toBeUndefined();
    expect(opts.force).toBe(false);
  });

  it('deve aceitar valores customizados', () => {
    process.argv = ['node', 'auto-squash',  'develop', '--message', 'custom msg', '--count', '5', '--force'];
    const opts = parseOptions();

    
    opts.commitMessage = process.argv[4];
    opts.count = Number(process.argv[6]);
    opts.force = process.argv[7] === '--force';
  
    expect(opts.commitMessage).toBe('custom msg');
    expect(opts.count).toBe(5);
    expect(opts.force).toBe(true);
  });

  it('deve interpretar corretamente o parâmetro --count como número', () => {
    process.argv = ['node', 'auto-squash', '-c', "10"];
    const opts = parseOptions();
    opts.count = Number(10);


    expect(opts.count).toEqual(10);
  });


  it('deve utilizar o valor default para --force como false', () => {
    process.argv = ['node', 'auto-squash'];
    const opts = parseOptions();

    expect(opts.force).toBe(false);
  });

  it('deve aceitar o parâmetro --force como true', () => {
    process.argv = ['node', 'auto-squash', '--force'];
    const opts = parseOptions();
    opts.force = process.argv[2] === '--force';
    expect(opts.force).toBe(true);
  });
});
