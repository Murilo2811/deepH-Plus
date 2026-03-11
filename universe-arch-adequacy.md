# Universe Architecture Adequacy

Adequação da arquitetura de backend e tipagem frontend para expor a estrutura completa de Universos via SSE, preparando o terreno para a visualização futura.

---

## Overview

O DAG engine (`multiverse.go`) já possui toda a informação necessária (handoffs, duração, dependências, canais), porém a camada SSE (`server_run.go`) e os tipos do frontend (`lib/api.ts`) não expõem esses dados. Este plano adequa a arquitetura sem alterar a lógica do engine — apenas surfaceia dados que já existem.

## Tipo de Projeto

**BACKEND** (Go) + **FRONTEND** (TypeScript types only, sem UI neste plano)

## Critérios de Sucesso

1. A API SSE envia `dag_plan` com a topologia completa do DAG antes da execução
2. A API SSE envia `universe_handoff` quando handoffs ocorrem entre universos
3. A API SSE envia `universe_duration` ao concluir cada universo
4. Os tipos TypeScript em `lib/api.ts` refletem os novos events
5. Todos os testes existentes continuam passando (zero breaking changes)
6. Novos testes unitários cobrem os novos callbacks e events SSE

---

## 🤖 Agentes & Skills (de `.agent/`)

### Tabela de Roteamento por Task

| Task | Agente (`.agent/agents/`) | Skills Carregadas (`.agent/skills/`) | Justificativa |
|---|---|---|---|
| **T1** Callbacks Go | `backend-specialist` | `clean-code`, `api-patterns` | Modificação de structs e interfaces Go — domínio de API patterns + clean code |
| **T2** RunDAG hooks | `backend-specialist` | `clean-code`, `api-patterns`, `lint-and-validate` | Lógica de invocação de callbacks no engine — precisa validar após editar |
| **T3** SSE Events | `backend-specialist` | `clean-code`, `api-patterns`, `lint-and-validate` | Streaming HTTP e formato de eventos SSE |
| **T4** Tipos TypeScript | `frontend-specialist` | `clean-code`, `lint-and-validate` | Tipagem de interfaces SSE (só types, sem UI) |
| **T5** Testes Go | `test-engineer` | `clean-code`, `testing-patterns`, `tdd-workflow`, `code-review-checklist`, `lint-and-validate` | Testes unitários com httptest — domínio exclusivo do test-engineer |
| **T6** Verificação | `debugger` | `clean-code`, `systematic-debugging` | Build, testes, root cause analysis se falhar |

### Agentes Não Utilizados (Justificativa)

| Agente | Por que NÃO usar |
|---|---|
| `orchestrator` | Não há multi-agent coordination neste plano (tasks sequenciais) |
| `database-architect` | Sem alterações em banco de dados |
| `security-auditor` | Sem superfície de ataque nova (SSE events são read-only e internos) |
| `devops-engineer` | Sem alterações em CI/CD ou infra |
| `mobile-developer` | Sem componentes mobile |
| `performance-optimizer` | Sem otimização de performance — apenas adição de dados |
| `qa-automation-engineer` | Testes são unitários Go, não E2E Playwright — `test-engineer` é mais adequado |
| `code-archaeologist` | Não é legacy code — engine é recente e bem documentado |

### Detalhe dos Agentes Selecionados

#### `backend-specialist` (T1, T2, T3)
- **Arquivo:** [`.agent/agents/backend-specialist.md`](file:///c:/Users/BOSS/deepH/.agent/agents/backend-specialist.md)
- **Skills do frontmatter:** `clean-code`, `nodejs-best-practices`, `python-patterns`, `api-patterns`, `database-design`, `mcp-builder`, `lint-and-validate`, `powershell-windows`, `bash-linux`, `rust-pro`
- **Skills ativas neste plano:** `clean-code` (padrões de código), `api-patterns` (design de API/SSE), `lint-and-validate` (verificação após edição)
- **Por que:** É o agente com domínio sobre lógica de servidor, API patterns, e design de structs — exatamente o que T1-T3 exigem

#### `frontend-specialist` (T4)
- **Arquivo:** [`.agent/agents/frontend-specialist.md`](file:///c:/Users/BOSS/deepH/.agent/agents/frontend-specialist.md)
- **Skills do frontmatter:** `clean-code`, `react-best-practices`, `web-design-guidelines`, `tailwind-patterns`, `frontend-design`, `lint-and-validate`
- **Skills ativas neste plano:** `clean-code` (padrões de código), `lint-and-validate` (verificação TypeScript)
- **Por que:** Domínio exclusivo sobre tipos TypeScript e arquivos de frontend — por boundary enforcement do `orchestrator.md`, SOMENTE o `frontend-specialist` pode editar `site/lib/api.ts`

#### `test-engineer` (T5)
- **Arquivo:** [`.agent/agents/test-engineer.md`](file:///c:/Users/BOSS/deepH/.agent/agents/test-engineer.md)
- **Skills do frontmatter:** `clean-code`, `testing-patterns`, `tdd-workflow`, `webapp-testing`, `code-review-checklist`, `lint-and-validate`
- **Skills ativas neste plano:** `clean-code`, `testing-patterns` (estratégia de teste Go), `tdd-workflow` (RED-GREEN-REFACTOR), `code-review-checklist` (revisão pós-teste)
- **Por que:** Por agent boundary enforcement, **somente** `test-engineer` pode editar arquivos `*_test.go`. Skills de TDD garantem testes de qualidade

#### `debugger` (T6)
- **Arquivo:** [`.agent/agents/debugger.md`](file:///c:/Users/BOSS/deepH/.agent/agents/debugger.md)
- **Skills do frontmatter:** `clean-code`, `systematic-debugging`
- **Skills ativas neste plano:** `systematic-debugging` (processo 4-fases: Reproduce → Isolate → Understand → Fix)
- **Por que:** Se testes falharem na verificação, o `debugger` aplica investigação sistemática de root cause

---

## Mapa de Skills Utilizadas

| Skill (`.agent/skills/`) | Descrição | Onde é usada |
|---|---|---|
| `clean-code` | Padrões globais de código, naming, SOLID | **TODAS** as tasks — é mandatory pelo GEMINI.md |
| `api-patterns` | REST, GraphQL, tRPC, design de API | T1, T2, T3 — design de callbacks e SSE |
| `lint-and-validate` | Linting, formatação, verificação de tipos | T2, T3, T4 — validação após cada edição |
| `testing-patterns` | Jest, Vitest, estratégias de teste | T5 — escrita de testes Go com padrão AAA |
| `tdd-workflow` | RED-GREEN-REFACTOR cycle | T5 — ciclo de desenvolvimento dos testes |
| `code-review-checklist` | Checklist de revisão de código | T5 — revisão dos testes antes de finalizar |
| `systematic-debugging` | Processo 4-fases de debugging | T6 — investigação de falhas se ocorrerem |

---

## Scripts de Validação (`.agent/scripts/`)

| Script | Quando Rodar | Task |
|---|---|---|
| `checklist.py` | Após T3 (pré-verificação rápida) | `python .agent/scripts/checklist.py .` |
| `verify_all.py` | T6 (verificação final completa) | `python .agent/scripts/verify_all.py .` |

---

## Task Breakdown

### T1: Enriquecer struct `Callbacks` com novos hooks
- **Agente:** `backend-specialist`
- **Skills ativas:** `clean-code`, `api-patterns`
- **Prioridade:** P0 (todos dependem disso)
- **Dependências:** nenhuma

**INPUT:**
```go
// ATUAL (multiverse.go L62-65)
type Callbacks struct {
    OnStart    func(idx int, u UniverseState)
    OnComplete func(idx int, br RunBranch)
}
```

**OUTPUT:**
```go
type Callbacks struct {
    OnStart    func(idx int, u UniverseState)
    OnComplete func(idx int, br RunBranch)
    // NOVOS:
    OnPlan     func(plan PlanView)
    OnHandoff  func(h HandoffEvent)
}
```

Structs auxiliares:
```go
type PlanView struct {
    Nodes []PlanNode `json:"nodes"`
    Edges []PlanEdge `json:"edges"`
}
type PlanNode struct {
    ID        string   `json:"id"`
    Label     string   `json:"label"`
    Spec      string   `json:"spec"`
    DependsOn []string `json:"depends_on"`
}
type PlanEdge struct {
    From    string `json:"from"`
    To      string `json:"to"`
    Kind    string `json:"kind"`
    Channel string `json:"channel"`
}
type HandoffEvent struct {
    From    string `json:"from"`
    To      string `json:"to"`
    Channel string `json:"channel"`
    Kind    string `json:"kind"`
    Chars   int    `json:"chars"`
}
```

**VERIFY:** `go build ./...` compila sem erros

---

### T2: Invocar novos callbacks dentro de `RunDAG`
- **Agente:** `backend-specialist`
- **Skills ativas:** `clean-code`, `api-patterns`, `lint-and-validate`
- **Prioridade:** P0
- **Dependências:** T1

**OUTPUT:**
- Após `PlanExecution()`, invocar `cbs.OnPlan()` com a topologia
- Após resolver handoffs, invocar `cbs.OnHandoff()`
- Garantir nil-checks em todos os callbacks novos

**VERIFY:** `go build ./...` + `go test ./internal/orchestrator/ -v`

---

### T3: Emitir novos SSE events em `server_run.go`
- **Agente:** `backend-specialist`
- **Skills ativas:** `clean-code`, `api-patterns`, `lint-and-validate`
- **Prioridade:** P0
- **Dependências:** T1, T2

**OUTPUT:**
- `OnPlan`: chama `sendEvent("dag_plan", pv)`
- `OnHandoff`: chama `sendEvent("universe_handoff", h)`
- No `OnComplete`, adicionar `duration_ms` ao payload de `agent_result`

**VERIFY:** `go build ./...` + `python .agent/scripts/checklist.py .`

---

### T4: Tipar novos events SSE no frontend
- **Agente:** `frontend-specialist`
- **Skills ativas:** `clean-code`, `lint-and-validate`
- **Prioridade:** P1
- **Dependências:** T3

**OUTPUT:**
```typescript
export interface RunEventDagPlan {
  nodes: Array<{ id: string; label: string; spec: string; depends_on: string[] }>;
  edges: Array<{ from: string; to: string; kind: string; channel: string }>;
}
export interface RunEventUniverseHandoff {
  from: string; to: string; channel: string; kind: string; chars: number;
}
// Atualizar RunEventAgentResult com duration_ms?: number
```

**VERIFY:** `cd site && npm run build`

---

### T5: Testes dos novos callbacks e SSE events
- **Agente:** `test-engineer`
- **Skills ativas:** `clean-code`, `testing-patterns`, `tdd-workflow`, `code-review-checklist`, `lint-and-validate`
- **Prioridade:** P1
- **Dependências:** T1, T2, T3

**OUTPUT (seguindo TDD - `tdd-workflow`):**
1. **RED:** Escrever `TestDAGPlanEvent` e `TestHandoffEvent` → devem falhar
2. **GREEN:** Verificar que já passam (callbacks implementados em T2)
3. **REFACTOR:** Limpar, aplicar `code-review-checklist`

**VERIFY:**
```bash
go test ./internal/api/ -v -run TestDAGPlan
go test ./internal/api/ -v -run TestHandoff
go test ./cmd/deeph/ -v -run TestMultiverse
```

---

### T6: Verificação Final
- **Agente:** `debugger`
- **Skills ativas:** `clean-code`, `systematic-debugging`
- **Scripts:** `verify_all.py`
- **Prioridade:** P2
- **Dependências:** T1-T5

**Checklist (processo 4-fases do `debugger`):**
- [ ] `go build ./...` — compila sem erros
- [ ] `go test ./internal/orchestrator/ -v` — todos passam
- [ ] `go test ./internal/api/ -v` — todos passam
- [ ] `go test ./cmd/deeph/ -v -run TestMultiverse` — todos passam
- [ ] `go test ./internal/runtime/ -v` — todos passam
- [ ] `cd site && npm run build` — compila sem erros TypeScript
- [ ] `python .agent/scripts/verify_all.py .` — verificação completa
- [ ] Teste manual: iniciar servidor, executar crew, verificar SSE events no DevTools

---

## Grafo de Dependências

```
T1 (backend-specialist: Callbacks struct)
 ├──→ T2 (backend-specialist: RunDAG hooks)
 │      └──→ T3 (backend-specialist: SSE events)
 │             ├──→ T4 (frontend-specialist: tipos TS)
 │             └──→ T5 (test-engineer: testes)
 └──────────────────→ T5 (test-engineer: testes)
                       └──→ T6 (debugger: verificação)
```

**Paralelismo possível:** T4 e T5 podem ser executadas em paralelo após T3

---

## Conformidade com Protocolos `.agent/`

| Protocolo | Status | Evidência |
|---|---|---|
| **Agent Boundary Enforcement** (orchestrator.md) | ✅ | Cada agente edita apenas seus arquivos de domínio |
| **File Type Ownership** (orchestrator.md) | ✅ | `*_test.go` → `test-engineer`, `site/**` → `frontend-specialist` |
| **Clean Code** (GEMINI.md Tier 0) | ✅ | `clean-code` skill ativa em TODAS as tasks |
| **Lint & Validate** (GEMINI.md Tier 1) | ✅ | `lint-and-validate` skill ativa em T2-T5 |
| **Final Checklist** (GEMINI.md Tier 1) | ✅ | `checklist.py` em T3, `verify_all.py` em T6 |

---

## Riscos Identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Callbacks nil panic | Baixa | Verificar nil antes de invocar cada callback novo |
| Breaking change em SSE | Nenhuma | Novos events são aditivos, events existentes não mudam |
| Frontend não processa events novos | Nenhuma | Events desconhecidos são ignorados pelo parseador atual |
| Mutex contention nos callbacks | Baixa | Callbacks são chamados dentro do lock existente — verificar |
