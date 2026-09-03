# Zezão Futsal — Front-end

Front-end em React (Vite) do sistema de gestão da escolinha de futsal. Consome a API do back-end em ASP.NET (projeto separado).

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Abre em `http://localhost:5173`. Como ainda não existe rota protegida por token de verdade, ao logar (mesmo sem back-end rodando) você recebe erro de conexão — isso é esperado até o back-end existir.

## Tema claro/escuro

O tema padrão é **claro**. Existe um botão de alternância (ícone de sol/lua) tanto na tela de login quanto no cabeçalho da Coordenação — a preferência fica salva no navegador (`localStorage`) e persiste entre sessões.

Toda a paleta de cores é controlada por variáveis CSS em `src/styles/theme.css`, alternadas via atributo `data-theme="light"` / `data-theme="dark"` no `<html>`. Componentes não precisam saber qual tema está ativo — todos usam as variáveis semânticas (`var(--bg)`, `var(--panel)`, `var(--accent)` etc.), então qualquer tela nova já herda os dois temas automaticamente.

## Estrutura de pastas

```
src/
  pages/
    Login/                  -> tela de login
    coordenador/             -> uma pasta por tela da área logada
      NovoAluno/, Alunos/, Contratos/, Financeiro/, Dashboard/
  layouts/
    CoordenadorLayout/       -> cabeçalho + abas + sub-navegação, envolve as páginas da coordenação
  routes/
    AppRoutes.jsx             -> roteamento (login -> coordenação, com proteção de rota)
  contexts/
    AuthContext.jsx           -> guarda o usuário logado (localStorage se "manter conectado")
    ThemeContext.jsx           -> guarda o tema claro/escuro (localStorage)
  hooks/
    useAuth.js                 -> acesso ao AuthContext
    useTheme.js                 -> acesso ao ThemeContext
  components/                 -> Button, Input, Select, StatusBadge, Loading, ThemeToggle (reutilizáveis)
  services/                   -> chamadas à API do back-end (um arquivo por área: aluno, contrato, financeiro, auth)
  models/                      -> formato dos dados + conversão da resposta da API
  styles/
    theme.css                  -> variáveis globais de cor/fonte para os dois temas
    coordenador.css             -> estilos compartilhados entre as telas da coordenação
  assets/
    Logo.jsx                    -> logo em SVG (bola ou ícone "play", conforme variant)
```

## Status atual

- [x] Tema claro (padrão) e escuro, com botão de alternância persistente
- [x] Tela de Login — integrada ao `AuthContext`
- [x] Roteamento entre Login e Coordenação, com proteção de rota (`RotaProtegida`)
- [x] Shell da Coordenação: cabeçalho com as 3 abas (Coordenação ativa, Professor/Campeonato desabilitados), sub-navegação
- [x] Página **Novo Aluno**: formulário completo (com upload de foto), aviso de checagem de duplicidade
- [x] Página **Alunos**: tabela com busca, sinalização de inadimplente, fallback para dados de exemplo se a API não responder
- [x] Página **Contratos**: card estilo "ticket" + formulário de emissão
- [x] Página **Financeiro**: cards de resumo, tabela de parcelas, botões de disparo de cobrança
- [x] Todos os `services/` já estruturados com os endpoints esperados do back-end (ver comentários em cada arquivo)
- [ ] Área do Professor
- [ ] Conectar de fato com o back-end (hoje as páginas caem no mock quando a API não responde)
- [ ] Migrar para TypeScript (pendente, conforme o padrão definido pela equipe)

## Endpoints que o back-end ainda precisa expor

Veja os comentários dentro de cada arquivo em `src/services/` — cada função já documenta o método HTTP, a rota esperada e o formato de dados.
