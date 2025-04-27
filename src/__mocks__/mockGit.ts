import type { SimpleGit } from 'simple-git';

type RequiredMock<T> = {
  [P in keyof T]: jest.Mock<any, any>;
};

// Garante que todos os métodos do SimpleGit estejam mockados
export function createMockGit(overrides: Partial<RequiredMock<SimpleGit>> = {}): RequiredMock<SimpleGit> {
  const mock: Partial<RequiredMock<SimpleGit>> = {};

  // Inicializa todos os métodos conhecidos como jest.fn()
  const keys = [
    'branch',
    'raw',
    'reset',
    'commit',
    'push',
    'getRemotes',
    'branchLocal',
    'show'
    // adicione aqui outros métodos que você usa da API do simple-git
  ] as const;

  for (const key of keys) {
    mock[key] = jest.fn();
  }

  // Aplica overrides se existirem
  return {
    ...(mock as RequiredMock<SimpleGit>),
    ...overrides,
  };
}
