# Zezão Futsal — Front-end

Interface web do sistema de gestão da escolinha de futsal **Zezão Futsal**. Consome a API REST em ASP.NET: <https://github.com/LuizpFelipe/API-ASPNET-ZEZAO-DDD>

## Objetivo

Dar à **Coordenação** e aos **Professores** uma interface para administrar alunos, turmas, contratos, financeiro, chamada e campeonatos da escolinha.

## Tecnologias

- **React 19** + **Vite**
- **React Router 7** (rotas protegidas por perfil)
- CSS com variáveis (tema claro/escuro)
- **oxlint** para lint
- Deploy no **Railway**

## ▶ Como executar

Pré-requisitos: Node.js 20+ e a API rodando (veja o README do back-end).

```bash
npm install
cp .env.example .env     # ajuste VITE_API_URL se a API não estiver em localhost:5260
npm run dev              # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Análise estática |

Variável de ambiente:

| Variável | Exemplo |
|---|---|
| `VITE_API_URL` | `http://localhost:5260/api` |

No back-end, adicione a URL do front em `Cors:Origens` (ex.: `http://localhost:5173`).

## Autenticação

- Login em `/login` chama `POST /api/Auth/login` e recebe um **JWT**.
- O token fica no `AuthContext` (`localStorage` quando "manter conectado" está marcado) e é enviado como `Authorization: Bearer` em todas as chamadas.
- `RotaProtegida` bloqueia rotas sem login e por perfil: **Coordenador** acessa `/coordenacao`; **Professor** acessa `/professor`; ambos acessam `/campeonato`.
- Se o token expira ou a API devolve `401`, o usuário volta ao login.
- Recuperação de senha em `/recuperar-senha` (código enviado por e-mail).

## Telas e rotas

| Rota | Tela | Perfil |
|---|---|---|
| `/login`, `/recuperar-senha` | Login e recuperação de senha | público |
| `/coordenacao/dashboard` | Painel com indicadores | Coordenador |
| `/coordenacao/novo-aluno` | Cadastro de aluno (foto, responsável, categoria, turma) | Coordenador |
| `/coordenacao/alunos` | Lista, busca, edição e inativação de alunos | Coordenador |
| `/coordenacao/turmas` | Turmas (criar, editar, inativar com transferência, reativar) | Coordenador |
| `/coordenacao/categorias` | Categorias | Coordenador |
| `/coordenacao/professores` | Professores | Coordenador |
| `/coordenacao/contratos` | Contratos e PDF | Coordenador |
| `/coordenacao/financeiro` | Resumo, parcelas, pagamento e cobrança | Coordenador |
| `/coordenacao/inadimplentes` | Alunos inadimplentes | Coordenador |
| `/professor` | Minhas turmas | Professor |
| `/professor/chamada/:turmaId` | Chamada diária | Professor |
| `/professor/chamada-mensal/:turmaId` | Chamada mensal | Professor |
| `/campeonato` e `/campeonato/:id` | Campeonatos: inscrições, times, jogos, estatísticas e ranking | Coordenador e Professor |

Todas as telas mostram mensagens de sucesso e erro (vindas do envelope `message` da API) e validam os campos antes de enviar.

## Estrutura

```
src/
├── features/                 # uma pasta por área do sistema
│   ├── auth/                 # login, recuperação, AuthContext
│   ├── aluno/  turma/  categoria/  professor/  usuario/
│   ├── contrato/  financeiro/  dashboard/
│   ├── painel-professor/     # minhas turmas e chamadas
│   ├── campeonato/           # inscrições, times, jogos, ranking
│   └── reposicao/
│       └── (cada feature: pages/, services/, models/ e, quando preciso, hooks/ e utils/)
├── routes/                   # AppRoutes e RotaProtegida
├── shared/                   # componentes reutilizáveis (Button, Input, Select, Modal, Loading, StatusBadge, ThemeToggle),
│                             # contextos (tema), utils (http.js) e assets
├── App.jsx
└── main.jsx
```

Fluxo: **Página → Service (fetch com token) → API → Model (converte a resposta)**.

## Tema claro/escuro

O padrão é claro; o botão de sol/lua alterna e a escolha fica salva no `localStorage`. As cores são variáveis CSS alternadas por `data-theme` no `<html>`.

## Deploy

Publicado no Railway. Defina `VITE_API_URL` apontando para a API publicada antes do build (`npm run build` gera o `dist/`).

## Instruções de uso

1. Entre com o e-mail e a senha fornecidos pela coordenação.
2. **Coordenador:** cadastre categorias, professores e turmas; depois cadastre alunos (o contrato é gerado); acompanhe Financeiro e Inadimplentes.
3. **Professor:** abra uma turma em "Minhas turmas" e faça a chamada.
4. **Campeonato:** crie, inscreva alunos, monte os times, gere os jogos, lance as estatísticas, finalize e veja o ranking.
