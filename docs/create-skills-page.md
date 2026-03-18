# Overview
A funcionalidade permitirá aos usuários visualizar, criar, editar e excluir Skills locais diretamente pela interface web (nova rota `/skills`). As Skills são salvas como arquivos YAML no diretório `skills/` do workspace do usuário.

## Project Type
WEB e BACKEND

## Success Criteria
- O usuário consegue ver a lista de Skills locais e de catálogo.
- O usuário consegue criar uma nova Skill preenchendo o YAML (ou usar um form genérico que foca no YAML, dado o quão flexível skills podem ser).
- O usuário consegue editar uma Skill existente via UI.
- O usuário consegue excluir uma Skill.
- O executável Go fornece endpoints REST completos (GET, POST, PUT, DELETE) para gerenciar arquivos na pasta `skills/`.

## Tech Stack
- **Backend (Go)**: Go stdlib `net/http` e `gopkg.in/yaml.v3` para manipular os arquivos YAML na pasta `skills/`.
- **Frontend (Next.js/React)**: React components, hooks para gerenciar o estado, Tailwind CSS para estilo. 

## File Structure
- `cmd/deeph/api/handlers.go` ou `internal/api/server.go`: Novos endpoints REST.
- `site/lib/api.ts`: Novas funções de front-end `saveSkill`, `updateSkill`, `deleteSkill`.
- `site/app/skills/page.tsx`: A nova página principal de gerenciamento.
- `site/components/app-sidebar.tsx`: Adicionar atalho no menu.

## Assigned Agents and Skills

Os seguintes Agentes e Skills do sistema deepH deverão ser ativados e guiar esta implementação:

### 🤖 Agentes Especialistas
- **`backend-specialist`**: Responsável pela camada Go (API REST, manipulação de arquivos YAML no OS local).
- **`frontend-specialist`**: Responsável pela camada do Next.js/React (UI, Formulários, Componentes Síncronos e API Client).

### 🛠️ Skills Relacionadas
- **`api-patterns`**: Assegurar os melhores padrões de roteamento REST (GET/POST/PUT/DELETE) no backend em Go.
- **`cc-skill-frontend-patterns`**: Padronização da interface cliente no React (`api.ts`).
- **`frontend-design`**: Garantir UX/UI Pixel-Perfect que combine com a atual arquitetura dark/accent da plataforma de Crews e Agents.

## Task Breakdown

### 1. Criar backend endpoints para CRUD de Skills
- **Agent**: `backend-specialist`
- **Skill**: `api-patterns`
- **Priority**: P1
- **Dependências**: Nenhuma
- **INPUT**: Adicionar suporte a POST / PUT / DELETE em `/api/skills` e `/api/skills/{name}` no `internal/api/server.go`. As skills cadastradas localmente residem na pasta `skills/` e usam sintaxe YAML. O backend precisa permitir ler a junção de `catalog.List()` + arquivos em `skills/` (caso o frontend precise, mas o `/api/skills` atual retorna só o catálogo). Recomendado adaptar o GET `/api/skills` para incluir skills locais ou criar um `/api/skills/local`.
- **OUTPUT**: Endpoints funcionando no Go.
- **VERIFY**: Realizar requests locais (curl) para criar e excluir skills, verificando se os YAMLs aparecem na pasta.

### 2. Adicionar funções no Client da API Frontend
- **Agent**: `frontend-specialist`
- **Skill**: `cc-skill-frontend-patterns`
- **Priority**: P2
- **Dependências**: Tarefa 1
- **INPUT**: Atualizar `site/lib/api.ts` incluindo `export async function getLocalSkills()`, `saveSkill(yamlStr)`, `updateSkill(name, yamlStr)`, `deleteSkill(name)`.
- **OUTPUT**: Métodos exportados prontos para uso nos componentes.
- **VERIFY**: TypeScript compila sem erros.

### 3. Criar a interface de Gerenciamento de Skills (`/skills`)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P2
- **Dependências**: Tarefa 2
- **INPUT**: Implementar `site/app/skills/page.tsx`. A página deve ter: 
  - Uma lista na lateral direita mostrando as Skills existentes (similar a `/crews`).
  - Um editor principal que possui modo YAML para escrever o código da skill.
  - Campos básicos como "Nome da Skill".
  - Botão de Salvar e capacidade de Deleção.
- **OUTPUT**: Uma UI consistente com a paleta original, similar ao Agent e Crew builder.
- **VERIFY**: Navegar para `/skills`, testar digitação no TextArea, verificar se preview atualiza, criar uma skill fictícia e ver se salva.

### 4. Adicionar navegação
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **Priority**: P3
- **Dependências**: Tarefa 3
- **INPUT**: Atualizar `site/components/app-sidebar.tsx` para incluir um link para "/skills" sob o segmento de plataforma.
- **OUTPUT**: Link visível no menu.
- **VERIFY**: Clicar no menu lateral leva para a rota recém-criada.

## Phase X: Verification
- [ ] Construir o Go frontend: `cd site && npm run build && cd .. && go build -o deeph.exe ./cmd/deeph`
- [ ] Rodar `deeph.exe ui` e criar uma skill.
- [ ] Verificar estruturação dos arquivos e logs de erro na interface.
