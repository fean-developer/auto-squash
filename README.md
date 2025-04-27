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

```bash
auto-squash -b <base-branch> -c <quantidade> -m "<mensagem do commit>"
```

#### Parâmetros disponíveis:

| Parâmetro           | Descrição                                                                 |
|---------------------|---------------------------------------------------------------------------|
| `-b, --base-branch` | Define a partir da branch base, main, develop, master, ou base especifica |
| `-m, commit-message`| Mensagem do commit squash (padrão: `feat: squash automático`)             |
| `-c, --count`       | Quantidade de commits a fazer squash (ex: 4)                              |
| `--force`           | Força o squash dos últimos commits ignorando a base                       |

### 💡 Exemplos

- Squash dos commits desde a branch `default` (base), base pode ser especificada:
 se algum merge for encontrado entre a branch base e a feature o squash não acontecera. por segurança!
 
- Squash definindo a branch base
- Exemplos:
  ```bash
    fean-pipeline git:(feature/MINHA_BRANCH) auto-squash -b TESTE_A  -m "Criando um novo commit até minha base especificada"
    31fc7a4 (HEAD -> feature/MINHA_BRANCH) Validando parametros dos arquivos
    4d33f3e Validando parametros dos arquivos de configuração | arquivo HOM  quebrado
    00b977b Validando parametros dos arquivos de configuração | arquivo HOM  quebrado
    61cc73e Validando parametros dos arquivos de configuração | arquivo HOM  quebrado
    e859944 Validando parametros dos arquivos de configuração | arquivo PRD quebrado
    11758da Validando parametros dos arquivos de configuração
    98d3c8e Ajuste gerais e de lint
    5979e98 Ajuste gerais e de lint
    1e0d387 Ajuste gerais e de lint
    f4fddc6 Ajustando trigger para main
    0c8ad03 removendo strategy
    92d9377 removendo strategy
    71f032a ajustando o runner adequado.
    4f5fb65 (TESTE_A) Alterando parametros
    c1454e3 Alterando parametro transactionPerSecond
  ```
* Resultado 
  ```bash
    Base detectada: TESTE_A
    📌 Branch atual: feature/MINHA_BRANCH
    🔎 Usando base: TESTE_A
    Fazendo squash de 13 commits:
    1. 71f032a283fe3d...........................
    2. 92d9377d428bca...........................
    3. 0c8ad0379e52ac...........................
    4. f4fddc6b9d1897...........................
    5. 1e0d387cabea57...........................
    6. 5979e983a16e24...........................
    7. 98d3c8e81fe51e...........................
    8. 11758da4ca3ee8...........................
    9. e859944db1372f...........................
    10. 61cc73ee0dadf...........................
    11. 00b977bc1d441...........................
    12. 4d33f3ee9d4df...........................
    13. 31fc7a463e030...........................
    🔧 Resetando com --soft até o commit base: 4f5fb657f8f2f...........................
    ✅ Novo commit criado com a mensagem: "Criando um novo commit até minha base especificada"
    ✅ Squash concluído com sucesso!

  ```

- Squash dos últimos 5 commits, ignorando a base:
- Exemplos:

  ```bash
    31fc7a4 (HEAD -> feature/MINHA_BRANCH) Criando um novo commit squash 5 commits
    4d33f3e Validando parametros dos arquivos de configuração | arquivo HOM  quebrado
    00b977b Validando parametros dos arquivos de configuração | arquivo HOM  quebrado
    61cc73e Validando parametros dos arquivos de configuração | arquivo HOM  quebrado
    e859944 Validando parametros dos arquivos de configuração | arquivo PRD quebrado
    11758da Validando parametros dos arquivos de configuração
    98d3c8e Ajuste gerais e de lint
    5979e98 Ajuste gerais e de lint
    1e0d387 Ajuste gerais e de lint
    f4fddc6 Ajustando trigger para main
    0c8ad03 removendo strategy
    92d9377 removendo strategy
    71f032a ajustando o runner adequado.
  ```

- Resultado

  ```bash
      fean-pipeline git:(feature/MINHA_BRANCH) auto-squash -c 5 -m "Criando um novo commit squash 5 commits"
      📌 Branch atual: feature/MINHA_BRANCH
      🔎 Usando base: develop
      Fazendo squash de 5 commits:
      1. e859944db1372...........................
      2. 61cc73ee0dadf...........................
      3. 00b977bc1d441...........................
      4. 4d33f3ee9d4df...........................
      5. 31fc7a463e030...........................
      🔧 Resetando com --soft até o commit base: 11758da4ca3ee...........................
      ✅ Novo commit criado com a mensagem: "Criando um novo commit squash 5 commits"
      ✅ Squash concluído com sucesso!
  ```

Contribuições são bem-vindas! Abra uma issue ou PR caso tenha ideias ou melhorias. 💬

> ⚠️ Lembre-se: o histórico local será reescrito. Use com cautela se sua branch já foi compartilhada.

---
