# **DOCS MAP**

Documentação deepH

* Visão Geral  
* Quick Start  
* Starter Kits  
* Conceitos  
* Arquitetura  
* Hello World Lab  
* Criar Agents/Skills  
* Usar em hello-world  
* Multiverso para Codegen CRUD  
* Universos (Docs Dedicada)  
* DeepSeek Tools vs Skills  
* Comandos  
* Tipos  
* Boas Práticas  
* Tutorial: Calculadora  
* Comparativo Claude Code

# **OVERVIEW**

## **Visão geral**

O 'deepH' é um runtime de agentes em Go com foco em leveza, orquestração e baixo consumo de token. O usuário define agents/crews em YAML, e o core fornece scheduler, context compiler, tool loop, budgets e observabilidade.

**Agents (YAML do usuário)**

Cada agent declara provider, prompt, skills, metadata e portas tipadas. O runtime conhece contratos, não personalidades embutidas.

**Skills (opcionais)**

Skills são executores locais instaláveis (skill add) e controladas por permissões/budgets. O catálogo pode crescer sem fechar o core.

**DAG \+ Channels \+ Ports**

O plano usa stages e dependências explicitas. Handoffs são porta porta, com merge\_policy, channel priority e budgets por canal.

**Type System semântico**

Tipos como code/go, summary/text, diagnostic/test orientam context compiler, merge, prioridade e handoffs inclusive no multiverso.

**Context Compiler**

Compila a janela por type \+ moment (tool\_loop, synthesis, etc.), com scoring, budgets e drops rastreáveis no run.

**Crews \+ Multiverse**

Crews definem universos e variações. Agora universos também podem formar DAG e compartilhar handoffs tipados (u1.result \-\> u3.context).

# **QUICK START**

## **Quick Start**

Fluxo mínimo para validar workspace, instalar skill, traçar e executar um agent.

go run ./cmd/deeph init  
cp examples/agents/guide.yaml agents/guide.yaml  
go run ./cmd/deeph skill add echo  
go run ./cmd/deeph validate  
go run ./cmd/deeph trace guide "teste"  
go run ./cmd/deeph run guide "teste"

Dica: para DeepSeek real, rode deeph provider add deepseek \--set-default e exporte DEEPSEEK\_API\_KEY.

# **STARTER KITS**

## **Starter Kits: instalar por nome (ou Git URL)**

Kits são bundles de produtividade que instalam skills \+ agents \+ crews e, quando necessário, configuram provider. O objetivo é zero fricção: digite o nome e rode.

\# listar kits locais embutidos  
deeph kit list

\# instalar kit por nome  
deeph kit add hello-next-tailwind  
deeph kit add hello-next-shadcn  
deeph kit add crud-next-multiverse

\# instalar kit remoto por git URL  
deeph kit add \[https://github.com/acme/deeph-kits.git\](https://github.com/acme/deeph-kits.git)

\# escolher manifesto específico dentro do repo  
deeph kit add \[https://github.com/acme/deeph-kits.git\#kits/next/kit.yaml\](https://github.com/acme/deeph-kits.git\#kits/next/kit.yaml)

**Comportamento do instalador**

* Instala automaticamente as skills requeridas do catálogo local (skill add implícito).  
* Escreve templates de agents/\*.yaml e crews/\*.yaml no workspace.  
* Para kits DeepSeek-first, scaffolda provider deepseek por padrão (pode desligar com \--skip-provider).  
* Preserva arquivos existentes por padrão; use \--force para sobrescrever mudanças.  
* Valida o projeto após instalação e mostra próximos passos (validate, crew list, run).

**Manifesto remoto (deeph-kit.yaml)**

\# deeph-kit.yaml (ou kit.yaml)  
name: next-crud-kit  
description: Next CRUD starter  
provider\_type: deepseek  
required\_skills:  
  \- file\_read\_range  
  \- file\_write\_safe  
  \- echo  
files:  
  \# carregar conteúdo de arquivo do próprio repo do kit  
  \- path: agents/crud\_backend.yaml  
    source: templates/agents/crud\_backend.yaml  
    
  \# ou inline direto no manifesto  
  \- path: crews/crud\_fullstack\_multiverse.yaml  
    content: |  
      name: crud\_fullstack\_multiverse  
      spec: crud\_contract

**Notas importantes**

* Modo Git espera deeph-kit.yaml ou kit.yaml no root do repo.  
* Use \#path/do/manifest.yaml quando o manifesto estiver em subpasta.  
* O parser bloqueia path traversal em source e mantém leitura dentro do repo clonado.

# **CONCEPTS**

## **Conceitos-chave**

**Spec de execução**

O spec pode ser simples (guide), paralelo (a+b) ou em estágios (a+b\>c\>d).

**Handoffs por porta**

Use io.inputs, io.outputs e depends\_on\_ports para roteamento fino e merge por porta.

**Channels entre universos**

Em crews, universos podem declarar depends\_on e trocar handoffs compactos tipados (u1.result \-\> u3.context\#summary/text).

**Momentos de contexto**

O compiler usa context\_moment (ex.: tool\_loop, synthesis) para priorizar tipos certos no prompt.

# **ARCHITECTURE**

## **Arquitetura (resumo prático)**

O runtime já entrega uma base forte de orquestração e token economy para workflows sérios em Go.

* Go runtime leve (core sem framework Python pesado).  
* Providers abstratos, com DeepSeek real e OpenAI/Anthropic/Ollama preparados para adapters.  
* Chat completions \+ tool calls DeepSeek controlados pelo runtime (não delega orquestração).  
* Tool broker compartilhado por execução (cache \+ coalescing \+ locks por recurso).  
* Budgets por agent, stage e channel; anti-loop em tool loop e publish.  
* Coach local sem LLM para onboarding progressivo no terminal.

\# Inspecione antes de rodar  
deeph trace "planner+reader\>coder\>reviewer" "implemente feature X"

\# Rode com multiverso \+ judge  
deeph run \-multiverse 0 \--judge-agent guide @reviewpack "implemente feature X"

\# Debug/export para UI  
deeph trace \-json "planner+reader\>coder\>reviewer" "feature X"

# **COMMANDS**

## **Comandos (referência completa)**

O dicionário abaixo resume o CLI atual. Para detalhes por comando, use também deeph command explain e deeph command list \--json.

### **Meta**

| Comando | Resumo |
| :---- | :---- |
| command explain | Explica um comando específico (com \-json). |
| command list | Lista o dicionário de comandos (com \-json). |
| help | Mostra uso da CLI e comandos disponíveis. |

### **Workspace**

| Comando | Resumo |
| :---- | :---- |
| init | Inicializa workspace deeph.yaml, pastas e exemplos. |
| validate | Valida root config, agents e skills YAML. |

### **Execution**

| Comando | Resumo |
| :---- | :---- |
| chat | Sessão de conversa fluida no terminal com histórico persistente (sessions/) para 1 agent ou multi-agent spec. |
| run | Executa agent(s) com orquestração DAG/channels. Suporta \-trace, \-multiverse, \-judge-agent e coach. |
| trace | Mostra plano de execução, stages, channels e handoffs. Suporta \-json e \-multiverse. |

### **Sessions**

| Comando | Resumo |
| :---- | :---- |
| session list | Lista sessões de chat persistidas. |
| session show | Mostra conteúdo/resumo de uma sessão salva. |

### **Crews**

| Comando | Resumo |
| :---- | :---- |
| crew list | Lista crews em crews/ (aliases de spec e universos de multiverse). |
| crew show | Mostra uma crew com universos, depends\_on, ports, output\_kind, merge e handoff chars. |

### **Agents**

| Comando | Resumo |
| :---- | :---- |
| agent create | Gera template de agent em agents/. |

### **Skills**

| Comando | Resumo |
| :---- | :---- |
| skill add | Instala skill template YAML em skills/. |
| skill list | Lista templates de skills oficiais. |

### **Providers**

| Comando | Resumo |
| :---- | :---- |
| provider add | Scaffold de provider (ex.: deepseek) em deeph.yaml, com \--set-default. |
| provider list | Lista providers configurados no workspace. |

### **Kits**

| Comando | Resumo |
| :---- | :---- |
| kit add | Instala kit por nome e aplica configurações necessárias (skills/agents/crews/provider). |
| kit list | Lista kits instaláveis por nome (starter bundles com agents/crews/skills). |

### **Types**

| Comando | Resumo |
| :---- | :---- |
| type explain | Explica um tipo/alias (code/go, string, tools). |
| type list | Lista tipos semânticos do runtime (com \-json). |

### **Coach**

| Comando | Resumo |
| :---- | :---- |
| coach reset | Reseta total ou parcial o estado local do coach. |
| coach stats | Mostra aprendizado local do coach (com scope/kind/json). |

Comandos úteis de export: use command list \-json, command explain \-json, type list \-json e trace \--json para docs internas, UI e automação.

# **TYPES**

## **Tipos semânticos (referência completa)**

O type system orienta contexto, handoffs, channels e merge. O runtime também aceita aliases (ex.: go, string) e normaliza para o tipo canônico.

**Resumo**

Total de tipos canônicos: 68

* artifact: 3  
* backend: 4  
* capability: 1  
* memory: 3  
* message: 5  
* plan: 2  
* code: 14  
* primitive: 6  
* context: 1  
* summary: 3  
* contract: 2  
* data: 2  
* db: 2  
* diagnostic: 3  
* frontend: 4  
* json: 3  
* test: 3  
* text: 5  
* tool: 2

### **Artifact**

| Tipo | Descrição |
| :---- | :---- |
| artifact/blob | Blob opaco / binário. |
| artifact/ref | Referência para artifact armazenado (preferido para payload grande). |
| artifact/summary | Resumo de artifact. |

### **Backend**

| Tipo | Descrição |
| :---- | :---- |
| backend/controller | Camada de controllers do backend. |
| backend/repository | Camada de repository/data access do backend. |
| backend/route | Camada de routes/handlers do backend. |
| backend/service | Camada de services/use-cases do backend. |

### **Capability**

| Tipo | Descrição |
| :---- | :---- |
| capability/tools | Capacidade/permissão de tools (não payload). |

### **Code**

| Tipo | Descrição |
| :---- | :---- |
| code/bash | Script shell. |
| code/c | Código C. |
| code/cpp | Código C++. |
| code/go | Código Go. |
| code/java | Código Java. |
| code/js | Código JavaScript. |
| code/jsx | Código JSX. |
| code/python | Código Python. |
| code/rust | Código Rust. |
| code/sql | SQL. |
| code/toml | Documento TOML. |
| code/ts | Código TypeScript. |
| code/tsx | Código TSX. |
| code/yaml | Documento YAML |

### **Context**

| Tipo | Descrição |
| :---- | :---- |
| context/compiled | Janela de contexto compilada pelo runtime. |

### **Contract**

| Tipo | Descrição |
| :---- | :---- |
| contract/json-schema | Contrato JSON Schema. |
| contract/openapi | Contrato OpenAPI. |

### **Data**

| Tipo | Descrição |
| :---- | :---- |
| data/csv | CSV. |
| data/table | Tabela lógica (linhas/colunas). |

### **Db**

| Tipo | Descrição |
| :---- | :---- |
| db/migration | Migração de banco. |
| db/schema | Schema/modelo de banco. |

### **Diagnostic**

| Tipo | Descrição |
| :---- | :---- |
| diagnostic/build | Diagnóstico de build/compile. |
| diagnostic/lint | Diagnóstico de lint. |
| diagnostic/test | Resultado/diagnóstico de testes. |

### **Frontend**

| Tipo | Descrição |
| :---- | :---- |
| frontend/client-api | Cliente de API no frontend. |
| frontend/component | Componente de UI do frontend. |
| frontend/form | Formulário/fluxo de entrada no frontend. |
| frontend/page | Página/tela de frontend. |

### **Json**

| Tipo | Descrição |
| :---- | :---- |
| json/array | JSON array. |
| json/object | JSON object. |
| json/value | JSON value genérico. |

### **Memory**

| Tipo | Descrição |
| :---- | :---- |
| memory/fact | Fato persistido. |
| memory/question | Pergunta aberta em memória. |
| memory/summary | Resumo persistido. |

### **Message**

| Tipo | Descrição |
| :---- | :---- |
| message/agent | Mensagem agent \> agent. |
| message/assistant | Mensagem de assistant/modelo. |
| message/system | Mensagem de sistema. |
| message/tool | Mensagem de tool. |
| message/user | Mensagem de usuário. |

### **Plan**

| Tipo | Descrição |
| :---- | :---- |
| plan/summary | Resumo de plano. |
| plan/task | Task/etapa de plano. |

### **Primitive**

| Tipo | Descrição |
| :---- | :---- |
| primitive/bool | Booleano. |
| primitive/float | Float. |
| primitive/int | Inteiro. |
| primitive/null | Null. |
| primitive/number | Número genérico. |
| primitive/string | String. |

### **Summary**

| Tipo | Descrição |
| :---- | :---- |
| summary/api | Resumo compacto de contrato/endpoints de API. |
| summary/code | Resumo compacto de código. |
| summary/text | Resumo compacto de texto. |

### **Test**

| Tipo | Descrição |
| :---- | :---- |
| test/e2e | Teste end-to-end (código/plano). |
| test/integration | Teste de integração (código/plano). |
| test/unit | Teste unitário (código/plano). |

### **Text**

| Tipo | Descrição |
| :---- | :---- |
| text/diff | Patch/diff. |
| text/markdown | Markdown. |
| text/path | Caminho de arquivo como texto. |
| text/plain | Texto simples. |
| text/prompt | Prompt/instrução. |

### **Tool**

| Tipo | Descrição |
| :---- | :---- |
| tool/error | Erro de tool estruturado. |
| tool/result | Resultado de tool estruturado. |

# **BEST PRACTICES**

## **Boas práticas (deepH)**

Se você quer resultados "clínicos" em custo e orquestração, essas regras pagam muito rápido.

* Rode deeph validate antes de run em qualquer mudança de YAML.  
* Use deeph trace (ou trace-json) para inspecionar stages, handoffs, channels e budgets antes de workflows maiores.  
* Tipifique io.inputs e io.outputs dos agents; evite deixar tudo como texto genérico.  
* Use depends\_on\_ports para handoff por porta em vez de broadcasting entre agents.  
* Prefira summary/\* \+ artifact/ref em handoffs, não texto bruto grande.  
* Use file\_read\_range antes de file\_read quando a tarefa for leitura de código/arquivo longo.  
* Aplique max\_tokens, merge\_policy e channel\_priority nas portas que recebem muitos handoffs.  
* Defina context\_max\_input\_tokens, context\_max\_channels e context\_max\_channel\_tokens por agent em workflows grandes.  
* Aplique publish\_max\_channels e publish\_max\_channel\_tokens para conter fan-out de handoffs.  
* Defina tool\_max\_calls / tool\_max\_exec\_ms por agent e stage\_tool\_max\_\* em stages paralelos.  
* Ative cache\_http\_get\_tools apenas quando GET puder ser cacheado com segurança.  
* Mantenha DEEPSEEK\_API\_KEY em variável de ambiente; não versionar chave no YAML.  
* Use chat para trabalho iterativo e run para pipelines determinísticos/repetíveis.  
* Use crews e multiverso para comparar estratégias; use judge-agent para reconciliar resultados.

**Próximo passo recomendado**

Comece pelo tutorial da calculadora para internalizar ports/channels e depois evolua para crew multiverso com judge.

Abrir tutorial da calculadora

Ver comparação com Claude Code

**Comandos de debug preferidos**

deeph validate  
deeph trace \-json "a+b\>c" "task"  
deeph run \-trace "a+b\>c" "task"  
deeph coach stats \-json

# **CUSTOMIZATION**

## **Passo a passo: criar seus próprios agents e skills**

No 'deepH', o usuário controla os agents. E skills têm dois níveis: configuração em YAML (mais comum) e novo tipo de skill no core em Go (avançado).

### **Agents (YAML do usuário)**

**Passo 1: Criar o arquivo base do agent**

Use agent create para gerar agents/\<nome\>.yaml com provider/model e template de IO.

deeph agent create calc\_backend \-provider deepseek \-model deepseek-chat

**Passo 2: Definir prompt e contrato**

Edite system\_prompt, skills, io.inputs, io.outputs, timeouts e metadata (context/tool budgets).

\# agents/calc\_backend.yaml (trecho)  
system\_prompt: |  
  Build the backend API route and controller for a Next.js calculator.  
skills:  
  \- file\_read\_range  
  \- file\_write\_safe  
io:  
  inputs:  
    \- name: plan\_input  
      accepts: \[plan/summary, json/object\]  
  outputs:  
    \- name: backend\_patch  
      produces: \[text/diff, summary/code\]

**Passo 3: Validar e testar o fluxo**

Use validate, trace, run e chat para iterar no comportamento do agent.

deeph validate  
deeph trace calc\_backend "crie route.ts e controller.ts"  
deeph chat calc\_backend

### **Skills (configuradas e novas)**

**Skill \- passo 1: Skill configurada (YAML) mais comum**

Crie skills/\*.yaml apontando para um tipo já suportado (file\_read, file\_read\_range, file\_write\_safe, http, echo).

\# skills/write\_code.yaml  
name: write\_code  
type: file\_write\_safe  
description: Writes source files safely inside the workspace  
params:  
  max\_bytes: 131072  
  create\_dirs: true  
  create\_if\_missing: true  
  overwrite\_default: false

**Skill \- passo 2: Usar a skill no agent**

Adicione o nome da skill em skills: no YAML do agent. O deepH expõe a skill para tool calling da DeepSeek automaticamente.

\# agents/calc\_frontend.yaml (trecho)  
skills:  
  \- file\_read\_range  
  \- write\_code

**Skill \- passo 3: Skill nova (tipo novo em Go) \- avançado**

Se precisar de comportamento novo (ex.: npm\_install, run\_tests), implemente no core Go e registre no runtime/catalog/validate.

\# pontos a editar (resumo)  
internal/runtime/skills.go      \# implementar Execute()  
internal/runtime/engine.go      \# schema da tool  
internal/project/validate.go    \# liberar type  
internal/catalog/skills.go      \# template opcional

# **PROJECTS**

## **Como usar o deepH dentro de um projeto (ex.: 'hello-world')**

As skills de arquivo do deepH são limitadas ao workspace. Então, para analisar/gerar código em 'hello-world', esse projeto precisa estar dentro do workspace (normalmente o próprio root do projeto).

### **Modo A (recomendado): deepH dentro do repo alvo**

Inicialize o deepH no root do projeto "hello-world". Agents e skills ficam versionados junto com o código, e file\_read\_range / file\_write\_safe conseguem atuar em todos os arquivos do repo.

cd \~/projetos/hello-world

\# com binário instalado (recomendado)  
deeph init  
deeph provider add deepseek \--set-default  
deeph skill add file\_write\_safe  
deeph skill add file\_read\_range  
deeph agent create planner \--provider deepseek \--model deepseek-chat  
deeph validate

\# analisar código da pasta hello-world  
deeph trace planner "analise a estrutura do projeto e proponha melhorias"

\# gerar código dentro da própria pasta hello-world  
deeph run "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer" "crie uma calculadora Next.js simples"

### **Modo B: workspace pai contendo vários projetos**

Crie um workspace deepH no diretório pai e mantenha projetos como subpastas. As skills continuam limitadas ao workspace, então hello-world/ pode ser analisado/alterado se estiver dentro desse pai.

mkdir \~/labs/deeph-workspace  
cd \~/labs/deeph-workspace  
deeph init

\# estrutura  
\# \~/labs/deeph-workspace/  
\#   deeph.yaml  
\#   agents/  
\#   skills/  
\#   hello-world/

deeph run planner "analise os códigos em hello-world/ e proponha refatorações"  
deeph run backend\_builder "crie hello-world/app/api/calc/route.ts e controller"

**Analisar código da pasta hello-world**

deeph trace reader "use file\_read\_range para ler hello-world/app/page.tsx e resumir"  
deeph run reader "use file\_read\_range para ler hello-world/app/page.tsx e resumir"

**Construir código dentro da pasta hello-world**

deeph run codegen "crie hello-world/lib/math/evaluator.ts com parse/eval seguro"  
\# com file\_write\_safe habilitada, a skill grava no arquivo

# **MULTIVERSE CODEGEN**

## **Crew CRUD Fullstack com universos colaborando por channels tipados**

Use multiverso para explorar arquitetura e implementação por camadas (contract, backend, frontend, tests, synth) com handoffs compactos e tipados entre universos.

**Crew YAML (exemplo)**

\# crews/crud\_fullstack\_multiverse.yaml  
name: crud\_fullstack\_multiverse  
description: CRUD fullstack com universos colaborando por contrato, backend, frontend, testes e sintese  
spec: crud\_contract

universes:  
  \- name: u\_contract  
    spec: crud\_contract  
    output\_port: openapi  
    output\_kind: contract/openapi  
    handoff\_max\_chars: 260

  \- name: u\_backend  
    spec: crud\_backend  
    depends\_on: \[u\_contract\]  
    input\_port: context  
    output\_port: api\_summary  
    output\_kind: summary/api  
    merge\_policy: latest  
    handoff\_max\_chars: 260  
    input\_prefix: |  
      \[universe\_hint\]  
      Implement backend CRUD from the upstream OpenAPI contract.

  \- name: u\_frontend  
    spec: crud\_frontend  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: page  
    output\_kind: frontend/page  
    merge\_policy: latest  
    handoff\_max\_chars: 240  
    input\_prefix: |  
      \[universe\_hint\]  
      Build UI from backend API summary. Prefer artifact refs \+ summaries.

  \- name: u\_test  
    spec: crud\_tester  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: routes\_tests  
    output\_kind: backend/route  
    merge\_policy: latest  
    handoff\_max\_chars: 220  
    input\_prefix: |  
      \[universe\_hint\]  
      Generate route-focused tests and validation checklist for backend CRUD.

  \- name: u\_synth  
    spec: crud\_synth  
    depends\_on: \[u\_contract, u\_backend, u\_frontend, u\_test\]  
    input\_port: context  
    output\_port: result  
    output\_kind: plan/summary  
    merge\_policy: append  
    handoff\_max\_chars: 260  
    input\_prefix: |  
      \[universe\_hint\]  
      Reconcile contract, backend, frontend and tests into one implementation plan.

**Channels tipados entre universos**

* u\_contract.openapi \-\> u\_backend.context\#contract/openapi  
* u\_backend.api\_summary \-\> u\_frontend.context\#summary/api  
* u\_backend.api\_summary \-\> u\_test.context\#summary/api  
* u\_frontend.page \-\> u\_synth.context\#frontend/page  
* u\_test.routes\_tests \-\> u\_synth.context\#backend/route  
* u\_contract.openapi \-\> u\_synth.context\#contract/openapi

Ideia central: um universo contribui para outro com o tipo certo e payload compacto (summary/\* / artifact/ref), sem replay bruto.

**Pesos por tipificação (proposta)**

Para CRUD/backend/frontend, vale priorizar tipos diferentes por fase (contract\_phase, backend\_codegen, frontend\_codegen, validate).

\# agents/crud\_backend.yaml (trecho)  
metadata:  
  context\_moment: "backend\_codegen"  
  \# proposta de pesos por tipo (para uma futura/extended policy)  
  type\_weights:  
    contract/openapi: "6"  
    db/schema: "5"  
    db/migration: "4"  
    backend/route: "5"  
    backend/controller: "5"  
    backend/service: "4"  
    summary/api: "4"  
    summary/code: "3"  
    text/prompt: "1"

**Boas práticas de multiverso para codegen**

* Crie os agents correspondentes (crud\_contract, crud\_backend, crud\_frontend, crud\_tester, crud\_synth) antes de rodar o crew.  
* Branch cedo, converge tarde: explore arquitetura e camada, não cada arquivo individual.  
* Use payload compacto no handoff (summary/\* \+ artifact/ref) e só releia código bruto quando necessário.  
* Separe portas semânticas (openapi, api\_summary, page, routes\_tests) em vez de usar sempre result.

# **DEEPSEEK**

## **DeepSeek tools vs skills do deepH (pesquisa \+ decisão prática)**

A DeepSeek suporta tool/function calling no /chat/completions, mas a execução real da ferramenta precisa acontecer na sua aplicação. No deepH, isso é feito pelas skills.

* DeepSeek Chat Completions suporta tools e tool\_choice (none, auto, required) no endpoint /chat/completions.  
* A resposta pode vir com finish\_reason: tool\_calls e message.tool\_calls\[\].function.arguments (string JSON).  
* A própria docs reforça que a função precisa ser executada pelo usuário/aplicação; o modelo não executa a tool sozinho. No deepH, isso mapeia para: DeepSeek tool call \-\> execução de skill local (file\_read\_range, file\_write\_safe, http, etc.).

Logo, para gerar código real em projeto, o usuário deve habilitar skills de filesystem; só tool calling da DeepSeek não escreve arquivo por conta própria.

**Links oficiais (DeepSeek)**

* DeepSeek Tool Calls Guide (official)  
* DeepSeek Create Chat Completion (official)

**Conclusão:** para construir/analisar código em um projeto real, use skills de filesystem no agent (file\_read\_range, file\_write\_safe). Tool calling da DeepSeek sozinho não escreve arquivos.

# **UNIVERSES**

## **Documentação de Universos (multiverso no deepH)**

Universos são branches de execução controladas em crews/\*.yaml. Eles permitem explorar estratégias diferentes e compartilhar handoffs tipados com baixo custo.

Regra prática: universo bom tem responsabilidade clara, output\_kind útil e depende só do necessário.

### **MODELO MENTAL**

**Como pensar universos corretamente**

* **1 universo \= 1 papel:** Evite universo genérico. Prefira nomes como u\_contract, u\_backend, u\_frontend, u\_test e u\_synth.  
* **Channels são inferidos:** No formato atual, você não declara um bloco channels: na crew. O runtime monta os channels automaticamente a partir de depends\_on \+ ports \+ output\_kind.  
* **Payload compacto sempre:** Use summary/\* e portas semânticas para circular contexto. Menos texto bruto, mais sinal para o próximo universo.  
* **DAG antes de paralelismo:** Primeiro garanta dependências corretas. Depois paralelize onde não há acoplamento (ex.: frontend e tests após backend).

### **SCHEMA**

**Campos de universe que importam**

universes:  
  \- name: u\_backend  
    spec: calc\_backend  
    input\_prefix: |  
      \[universe\_hint\]  
      Priorize segurança e validação de entrada.  
    input\_suffix:  
    depends\_on: \[u\_contract\]  
    input\_port: context  
    output\_port: api\_summary  
    output\_kind: summary/api  
    merge\_policy: latest  
    handoff\_max\_chars: 260

* name: nome único do universo.  
* spec: agent/spec a executar nesse universo.  
* depends\_on: universos upstream (forma a DAG).  
* input\_port / output\_port: portas de handoff.  
* output\_kind: tipo semântico emitido no handoff.  
* merge\_policy: estratégia de merge no consumidor (append ou latest).  
* handoff\_max\_chars: limite de caracteres no handoff entre universos.

# **STEP BY STEP**

## **Passo a passo completo (Universos)**

**Universos passo 1: Defina o objetivo de cada universo**

Separe por responsabilidade real: contrato, backend, frontend, testes e sintese. Evite universos duplicados sem função clara.

\# exemplo de specs por responsabilidade  
calc\_contract  
calc\_backend  
calc\_frontend  
calc\_tester  
calc\_synth

**Universos passo 2: Crie a crew com universes**

A crew é o container do multiverso. Cada universe aponta para um spec e pode sobrescrever comportamento com prefix/suffix.

\# crews/calc\_multiverse.yaml  
name: calc\_multiverse  
description: Calculadora fullstack com universos colaborando  
spec: calc\_contract  
universes:  
  \- name: u\_contract  
    spec: calc\_contract  
    output\_port: openapi  
    output\_kind: contract/openapi  
  \- name: u\_backend  
    spec: calc\_backend  
    depends\_on: \[u\_contract\]  
    input\_port: context  
    output\_port: api\_summary  
    output\_kind: summary/api  
  \- name: u\_frontend  
    spec: calc\_frontend  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: page  
    output\_kind: frontend/page  
  \- name: u\_test  
    spec: calc\_tester  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: routes\_tests  
    output\_kind: backend/route  
  \- name: u\_synth  
    spec: calc\_synth  
    depends\_on: \[u\_contract, u\_backend, u\_frontend, u\_test\]  
    input\_port: context  
    output\_port: result  
    output\_kind: plan/summary

**Universos passo 3: Entenda como os channels são formados**

No deepH atual, channels entre universos são inferidos de depends\_on \+ output\_port/input\_port. O tipo vem do output\_kind do universo de origem.

\# relações inferidas no exemplo acima:  
\# u\_contract.openapi \-\> u\_backend.context\#contract/openapi  
\# u\_backend.api\_summary \-\> u\_frontend.context\#summary/api  
\# u\_backend.api\_summary \-\> u\_test.context\#summary/api  
\# u\_frontend.page \-\> u\_synth.context\#frontend/page  
\# u\_test.routes\_tests \-\> u\_synth.context\#backend/route

**Universos passo 4: Controle merge e tamanho do handoff**

Use merge\_policy e handoff\_max\_chars para impedir payload inflado e replay desnecessário.

\# por universe consumidor  
\- name: u\_synth  
  depends\_on: \[u\_contract, u\_backend, u\_frontend, u\_test\]  
  input\_port: context  
  output\_port: result  
  output\_kind: plan/summary  
  merge\_policy: append  
  handoff\_max\_chars: 260

**Universos passo 5: Trace antes de run**

Sempre rode trace para validar DAG, scheduler e handoffs antes da execução real.

deeph validate  
deeph crew list  
deeph crew show calc\_multiverse  
deeph trace \-multiverse 0 @calc\_multiverse "crie calculadora Next.js com API /api/calc"

**Universos passo 6: Rode com judge para consolidar**

Quando houver múltiplos outputs relevantes, use judge-agent para reconciliar e escolher a melhor síntese final.

deeph run \-multiverse 0 \-judge-agent guide @calc\_multiverse "crie calculadora Next.js com API /api/calc"

**Universos passo 7: Itere com ajuste fino por universe**

Se o problema está no backend, ajuste u\_backend (prompt/skills/metadata) em vez de mexer em todo o pipeline.

\# exemplos de ajustes focados  
\# \- aumentar handoff\_max\_chars só no u\_backend  
\# \- trocar merge\_policy de append para latest no u\_frontend  
\# \- reforçar input\_prefix de segurança no u\_test

**Comandos de operação diária**

\# validar estrutura  
deeph validate

\# inspecionar crews  
deeph crew list  
deeph crew show calc\_multiverse

\# planejar execução  
deeph trace \-multiverse 0 @calc\_multiverse "task"

\# executar multiverso \+ judge  
deeph run \-multiverse 0 \--judge-agent guide @calc\_multiverse "task"

# **TROUBLESHOOTING**

## **Erros comuns e correção rápida**

**depends\_on unknown universe**

Nome no depends\_on não bate com name de outro universo.

**dependency cycle detected**

A DAG tem ciclo. Quebre o loop (ex.: A depende de B e B depende de A).

**Handoff grande demais**

Reduza handoff\_max\_chars e force saída em summary/\* para não explodir token.

**Saída inconsistente entre universos**

Padronize contratos de porta e use output\_kind semântico por camada.

*(Fim do documento. Nota: O tutorial detalhado da Calculadora mencionado nas páginas 21-32 foi compilado num guia à parte na interação anterior, mas as informações teóricas sobre universos presentes nele foram integradas nas secções acima).*