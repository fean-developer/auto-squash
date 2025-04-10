[![npm](https://img.shields.io/npm/v/@fean-developer/auto-squash?color=blue)](https://www.npmjs.com/package/@fean-developer/auto-squash)
![license](https://img.shields.io/npm/l/@fean-developer/auto-squash)
![downloads](https://img.shields.io/npm/dt/@fean-developer/auto-squash)
## 🧪 Auto Squash

Script de linha de comando para fazer squash automático de commits no Git.

### 📌 O que ele faz?

Este script facilita o processo de squash de commits consecutivos em uma única linha de comando. Ele:

- Identifica automaticamente os commits feitos desde uma branch default;
- Permite limitar a quantidade de commits a serem unificados;
- Suporta o modo forçado para ignorar a branch base e unificar os últimos `n` commits;
- Realiza `git reset --soft` até o commit base e cria um novo commit com a mensagem informada.

Ideal para manter o histórico de commits limpo antes de fazer merge de branches.

### 📦 Instalação

```bash
npm install -g @fean-developer/auto-squash
```

### 🚀 Uso

```bash
auto-squash -c <quantidade> -m "<mensagem do commit>"
```

#### Parâmetros disponíveis:

| Parâmetro           | Descrição                                                                 |
|---------------------|---------------------------------------------------------------------------|
| `-m, --message`     | Mensagem do commit squash (padrão: `feat: squash automático`)             |
| `-c, --count`       | Quantidade de commits a fazer squash (ex: 4)                              |
| `--force`           | Força o squash dos últimos commits ignorando a base                       |

### 💡 Exemplos

- Squash dos commits desde a branch `default`:
  ```bash
  auto-squash -m "feat: compactando todos commits"
  ```

- Squash dos últimos 4 commits, ignorando a base:
  ```bash
  auto-squash -c 4 -m "feat: juntando 4 commits" --force
  ```

Contribuições são bem-vindas! Abra uma issue ou PR caso tenha ideias ou melhorias. 💬

> ⚠️ Lembre-se: o histórico local será reescrito. Use com cautela se sua branch já foi compartilhada.

---