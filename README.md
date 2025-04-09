# auto-squash

🚀 Uma CLI em TypeScript para fazer squash automático de commits desde o ponto em que sua branch divergiu da `main` (ou outra base).

## Instalação

```bash
npm install -g ./ # ou npm link dentro do repositório clonado
```

## Uso

```bash
auto-squash
```

### Opções

- `-b, --base <branch>`: Define a branch base (padrão: `main`)
- `-m, --message <mensagem>`: Define a mensagem do commit após o squash
- `-c, --count <n>`: Squasha apenas os últimos `n` commits (em vez de todos desde a base)

### Exemplo:

```bash
auto-squash -b develop -m "feat: final squash da feature"
auto-squash -c 3 -m "squash dos últimos 3 commits"
```

## O que ele faz?

1. Detecta o commit base comum entre a branch atual e a branch informada (`main`, por padrão).
2. Verifica todos os commits desde esse ponto.
3. Se houver mais de 1 commit, faz um `git reset --soft` até esse ponto.
4. Cria um novo commit unificando todos.

---

> ⚠️ Lembre-se: o histórico local será reescrito. Use com cautela se sua branch já foi compartilhada.

---