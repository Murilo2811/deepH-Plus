# **TUTORIAL: Step by step: calculadora no deepH**

Este tutorial mostra como usar o deepH para ORQUESTRAR a criação de uma calculadora fullstack em Next.js: frontend (UI), backend (API route/controller) e integração. O foco é onde entram os prompts, como usar skills e como a DeepSeek participa via tool calling.

Objetivo: aprender ports/channels tipados e DAG no 'deepH' usando um caso simples e útil. Depois você pode trocar o solver por uma skill determinística.

## **UNIVERSE MAP: Mapa visual da calculadora (estilo caderno)**

Cada universo cuida de uma parte da calculadora e conversa por channels tipados. No runtime atual, esses channels são inferidos automaticamente via depends\_on \+ ports.

* **u\_contract**: Define o contrato da API da calculadora. out: contract/openapi  
* **u\_backend**: Cria route/controller/evaluator do backend. out: summary/api  
* **u\_frontend**: Monta a UI e integração com POST /api/calc. out: frontend/page  
* **u\_test**: Gera testes e checklist das rotas. out: backend/route  
* **u\_synth**: Concilia tudo em um plano final enxuto. out: plan/summary

**Relações:**

* u\_contract.openapi \-\> u\_backend.context | type: contract/openapi | peso: 6 | momento: backend\_codegen  
* u\_backend.api\_summary \-\> u\_frontend.context | type: summary/api | peso: 5 | momento: frontend\_codegen  
* u\_backend.api\_summary \-\> u\_test.context | type: summary/api | peso: 5 | momento: validate  
* u\_frontend.page \-\> u\_synth.context | type: frontend/page | peso: 4 | momento: synthesis  
* u\_test.routes\_tests \-\> u\_synth.context | type: backend/route | peso: 4 | momento: synthesis  
* u\_contract.openapi \-\> u\_synth.context | type: contract/openapi | peso: 6 | momento: synthesis

\# Forma correta hoje: relações declaradas em universes  
universes:  
  \- name: u\_contract  
    output\_port: openapi  
    output\_kind: contract/openapi  
    
  \- name: u\_backend  
    depends\_on: \[u\_contract\]  
    input\_port: context  
    output\_port: api\_summary  
    output\_kind: summary/api  
    merge\_policy: latest  
    handoff\_max\_chars: 260  
    
  \- name: u\_frontend  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: page  
    output\_kind: frontend/page  
    
  \- name: u\_test  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: routes\_tests  
    output\_kind: backend/route  
    
  \- name: u\_synth  
    depends\_on: \[u\_contract, u\_backend, u\_frontend, u\_test\]  
    input\_port: context  
    output\_port: result  
    output\_kind: plan/summary

## **UNIVERSE STEPS: Passo a passo dos universos (correto e completo)**

Fluxo recomendado para construir a calculadora com multiverso, sem loop inútil e com consumo de token previsível.

### **Universo passo 1: Defina os agentes-base por camada**

Antes do multiverso, garanta os agentes especialistas (contrato, backend, frontend, teste e sintese). Cada universo vai reaproveitar esses specs.

deeph agent create calc\_contract \-provider deepseek \-model deepseek-chat  
deeph agent create calc\_backend \-provider deepseek \-model deepseek-chat  
deeph agent create calc\_frontend \-provider deepseek \-model deepseek-chat  
deeph agent create calc\_tester \-provider deepseek \-model deepseek-chat  
deeph agent create calc\_synth \-provider deepseek \-model deepseek-chat

### **Universo \- passo 2: Monte a crew com universos e dependências**

Modele a DAG entre universos com depends\_on. Pense como pipeline: contrato \-\> implementação \-\> validação \-\> síntese.

\# crews/calc\_multiverse.yaml  
name: calc\_multiverse  
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

### **Universo passo 3: Conecte os channels tipados**

No deepH atual, os channels entre universos são inferidos por depends\_on \+ ports. O tipo vem do output\_kind do universo de origem.

\# crews/calc\_multiverse.yaml (trecho)  
universes:  
  \- name: u\_contract  
    output\_port: openapi  
    output\_kind: contract/openapi

  \- name: u\_backend  
    depends\_on: \[u\_contract\]  
    input\_port: context  
    output\_port: api\_summary  
    output\_kind: summary/api

  \- name: u\_frontend  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: page  
    output\_kind: frontend/page

  \- name: u\_test  
    depends\_on: \[u\_backend\]  
    input\_port: context  
    output\_port: routes\_tests  
    output\_kind: backend/route

### **Universo \- passo 4: Aplique pesos e momentos por fase**

Dê mais peso ao que importa em cada etapa. Exemplo: contrato pesa mais no backend; UI pesa mais no synth final.

\# agents/calc\_backend.yaml (trecho)  
metadata:  
  context\_moment: "backend\_codegen"  
  type\_weights:  
    contract/openapi: "6"  
    summary/api: "5"  
    frontend/page: "1"  
  context\_max\_input\_tokens: "1000"  
  context\_max\_channels: "10"

\# agents/calc\_synth.yaml (trecho)  
metadata:  
  context\_moment: "synthesis"  
  type\_weights:  
    frontend/page: "4"  
    backend/route: "4"  
    contract/openapi: "6"

### **Universo passo 5: Trace antes de executar**

Valide a DAG, os channels e os handoffs no trace. Corrija contratos antes de gastar token no run.

deeph validate  
deeph trace \--multiverse 0 @calc\_multiverse "crie calculadora Next.js com API /api/calc"

### **Universo passo 6: Rode com judge para reconciliar**

Execute os universos e use um judge-agent para consolidar a melhor saída final.

deeph run \-multiverse 0 \-judge-agent guide @calc\_multiverse "crie calculadora Next.js com API /api/calc"  
deeph run \-trace \-multiverse \-judge-agent guide @calc\_multiverse "adicione validação de expressão"

### **Universo \- passo 7: Itere por porta (sem loop cego)**

Ajuste só o universo/porta com problema. Evite retrabalho global em todo pipeline.

\# exemplo de ajuste fino  
\# \- aumentar max\_tokens apenas em u\_backend.context  
\# \- trocar merge\_policy de append \-\> latest em inputs específicos  
\# \- reduzir handoff\_max\_chars no u\_test para payload compacto

## **CONSTRUÇÃO GERAL \- PASSO A PASSO**

### **PASSO 1\. Inicialize o workspace**

Crie o workspace do deepH e instale as skills mínimas. 'echo' ajuda no debug e 'file\_write\_safe' permite geração real de arquivos no app Next alvo.

go run ./cmd/deeph init  
go run ./cmd/deeph skill add echo  
go run ./cmd/deeph skill add file\_write\_safe  
go run ./cmd/deeph validate

### **PASSO 2\. Configure provider (mock para desenho de fluxo, DeepSeek para geração real)**

Para validar a orquestração sem custo, use 'local\_mock'. Para gerar código de verdade, use DeepSeek via 'chat completions' \+ 'tool calls' (mapeados para skills do deepH).

\# opção rápida (mock já vem no init)  
go run ./cmd/deeph provider list

\# opção DeepSeek (scaffold)  
go run ./cmd/deeph provider add deepseek \-set-default  
export DEEPSEEK\_API\_KEY="sua\_chave"

### **PASSO 3\. Estrutura do app alvo (Next)**

Crie (ou tenha) um app Next alvo onde os agents vão trabalhar. O deepH orquestra a geração/edição dos arquivos, o projeto final é a calculadora em Next.

\# exemplo (fora do deepH) para criar o app alvo  
npx create-next-app@latest calc-app \--ts \--app \--eslint

\# estrutura alvo esperada (simplificada)  
calc-app/  
  app/  
    page.tsx  
  api/calc/route.ts  
  lib/calc/  
    controller.ts  
    evaluator.ts

### **PASSO 4\. Crie os agents da pipeline de geração**

Vamos criar agents especializados. A ideia é o planner definir contrato da API, backend gerar 'route/controller', frontend gerar UI e reviewer validar integração.

go run ./cmd/deeph agent create calc\_planner  
go run ./cmd/deeph agent create calc\_backend  
go run ./cmd/deeph agent create calc\_frontend  
go run ./cmd/deeph agent create calc\_reviewer

### **PASSO 5\. Onde a pessoa coloca os prompts dos agents**

Os prompts principais ficam em 'agents/*.yaml' no campo 'system\_prompt'. Variações de universo (multiverso) entram em 'crews/*.yaml' com 'input\_prefix/input\_suffix'.

\# agents/calc\_planner.yaml  
name: calc\_planner  
provider: deepseek  
model: deepseek-chat  
system\_prompt: |  
  You are the planner for a Next.js calculator app.  
  Define:  
  \- API contract (request/response)  
  \- file plan  
  \- responsibilities for backend and frontend agents  
  Be explicit about assumptions and keep outputs compact.  
skills:  
  \- echo  
io:  
  inputs:  
    \- name: task  
      accepts: \[text/plain\]  
      required: true  
      max\_tokens: 220  
  outputs:  
    \- name: plan  
      produces: \[plan/summary, json/object\]  
metadata:  
  context\_moment: "discovery"  
  context\_max\_input\_tokens: "900"

\# crews/calc\_next.yaml (variação de universo)  
name: calc\_next  
spec: "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"  
universes:  
  \- name: strict  
    spec: "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"  
    input\_prefix: |  
      \[universe\_hint\]  
      Enforce input validation and error handling.

### **PASSO 6\. Defina o agent de backend (API route \+ controller)**

O backend consome o plano e gera arquivos de API. Se você quiser criar arquivos automaticamente, ele deve usar skills de filesystem (leitura e escrita).

\# agents/calc\_backend.yaml  
name: calc\_backend  
provider: deepseek  
model: deepseek-chat  
system\_prompt: |  
  Build the backend for a Next.js calculator.  
  Create:  
  \- app/api/calc/route.ts  
  \- lib/calc/controller.ts  
  \- lib/calc/evaluator.ts  
  Requirements:  
  \- support \+,-,\*,/  
  \- validate invalid expressions  
  \- return JSON { ok, result, error? }  
skills:  
  \- file\_read\_range  
  \- file\_write\_safe  
  \- echo  
depends\_on: \[calc\_planner\]  
depends\_on\_ports:  
  plan\_input: \[calc\_planner.plan\]  
io:  
  inputs:  
    \- name: plan\_input  
      accepts: \[plan/summary, json/object, text/plain\]  
      required: true  
      merge\_policy: latest  
      channel\_priority: 4  
      max\_tokens: 300  
  outputs:  
    \- name: backend\_patch  
      produces: \[text/diff, summary/code\]  
metadata:  
  context\_moment: "tool\_loop"  
  max\_tool\_rounds: "4"  
  tool\_max\_calls: "8"

### **PASSO 7\. Defina o agent de frontend (UI em Next)**

O frontend consome o plano (e opcionalmente a saída do backend) para criar uma UI simples com input, botão e resultado.

\# agents/calc\_frontend.yaml  
name: calc\_frontend  
provider: deepseek  
model: deepseek-chat  
system\_prompt: |  
  Build a simple Next.js calculator UI in app/page.tsx.  
  Requirements:  
  \- expression input  
  \- submit button  
  \- result panel  
  \- error state  
  \- fetch POST /api/calc  
skills:  
  \- file\_read\_range  
  \- file\_write\_safe  
  \- echo  
depends\_on: \[calc\_planner\]  
depends\_on\_ports:  
  plan\_input: \[calc\_planner.plan\]  
io:  
  inputs:  
    \- name: plan\_input  
      accepts: \[plan/summary, json/object, text/plain\]  
      required: true  
      merge\_policy: latest  
      channel\_priority: 5  
      max\_tokens: 260  
  outputs:  
    \- name: frontend\_patch  
      produces: \[text/diff, summary/code\]  
metadata:  
  context\_moment: "tool\_loop"  
  max\_tool\_rounds: "4"

### **PASSO 8\. Defina o reviewer/integrator (conecta backend \+ frontend)**

O reviewer consome patches/resumos dos dois lados e verifica consistência (payload, rota, UX, erros). Ele pode sugerir correções ou consolidar um patch final.

\# agents/calc\_reviewer.yaml  
name: calc\_reviewer  
provider: deepseek  
model: deepseek-chat  
system\_prompt: |  
  Review and integrate Next.js calculator backend \+ frontend.  
  Check API payload contract, fetch call compatibility, error handling and UX clarity.  
  Produce a compact review and final patch suggestions.  
skills:  
  \- echo  
depends\_on: \[calc\_backend, calc\_frontend\]  
depends\_on\_ports:  
  backend: \[calc\_backend.backend\_patch\]  
  frontend: \[calc\_frontend.frontend\_patch\]  
io:  
  inputs:  
    \- name: backend  
      accepts: \[text/diff, summary/code, text/plain\]  
      required: true  
      merge\_policy: latest  
      channel\_priority: 4  
      max\_tokens: 260  
    \- name: frontend  
      accepts: \[text/diff, summary/code, text/plain\]  
      required: true  
      merge\_policy: latest  
      channel\_priority: 4  
      max\_tokens: 260  
  outputs:  
    \- name: review  
      produces: \[summary/text, text/markdown\]  
metadata:  
  context\_moment: "validate"

### **PASSO 9\. Trace e run da pipeline fullstack**

Use 'trace' para ver handoffs/ports e depois 'run' para executar o fluxo de geração. No 'chat', você itera refinando prompts e saídas.

go run ./cmd/deeph validate

go run ./cmd/deeph trace "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer" "crie uma calculadora Next.js simples"

go run ./cmd/deeph run "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer" "crie uma calculadora Next.js simples"

\# modo iterativo  
go run ./cmd/deeph chat "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"

### **PASSO 10\. (Opcional) Multiverso para comparar implementações**

Rode múltiplos universos (baseline/strict/fast) e use 'judge-agent' para escolher a melhor implementação. Universos podem trocar handoffs entre si via 'depends\_on'.

\# crews/calcpack.yaml (resumo)  
name: calcpack  
spec: "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"  
universes:  
  \- name: baseline  
    spec: "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"  
    output\_kind: summary/text  
  \- name: strict  
    spec: "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"  
    output\_kind: diagnostic/test  
    input\_prefix: |  
      Enforce stricter validation, safer parsing and explicit error states.  
  \- name: synth  
    spec: "calc\_planner\>calc\_backend+calc\_frontend\>calc\_reviewer"  
    output\_kind: plan/summary  
    depends\_on: \[baseline, strict\]  
    merge\_policy: append  
    handoff\_max\_chars: 220

go run ./cmd/deeph trace \--multiverse 0 @calcpack "crie uma calculadora Next.js simples"

go run ./cmd/deeph run \-multiverse 0 \-judge-agent guide @calcpack "crie uma calculadora Next.js simples"

### **PASSO 11\. Pode usar tool da DeepSeek? Sim, mas via skills do deepH**

A DeepSeek suporta tool/function calling, mas as ferramentas são definidas por você e executadas pela sua aplicação. No deepH, isso significa: model \-\> pede tool \-\> deepH executa skill local. Para geração de app, skills são a ponte certa (read/write/list/test).

\# visão prática no deepH  
\# DeepSeek tool call             deepH skill execution  
\# "read\_file"             \---\>   file\_read / file\_read\_range  
\# "write\_file"            \---\>   file\_write\_safe  
\# "run\_tests"             \---\>   shell\_gated ou test\_runner (skill custom)

\# prompt dos agents continua em agents/\*.yaml (system\_prompt)  
\# tools disponíveis continuam em skills: \[...\]

### **PASSO 12\. Resultado final esperado (qual seria)**

No final da pipeline, o reviewer deve entregar patch/resumo e os arquivos da calculadora Next criados/ajustados. A UI faz POST para a API e exibe resultado/erro.

\# resultado esperado (exemplo)  
calc-app/  
  app/  
    page.tsx             \# formulário \+ fetch para /api/calc  
  api/  
    calc/  
      route.ts           \# POST { expression } \-\> { ok, result | error }  
  lib/  
    calc/  
      controller.ts  
      evaluator.ts       \# valida request e chama evaluator  
                         \# parse/eval de \+, \-, \*, /

**Comportamento final da UI**

* Input: 2\*(7+5)-9  
* Click: "Calcular"  
* Output: "135"  
* Error example: "Expressão inválida"

## **NOTAS: Observações importantes**

* **Prompts dos agents:** 'agents/*.yaml' em 'system\_prompt'. Variações de universo: 'crews/*.yaml' com 'input\_prefix'/'input\_suffix'.  
* **DeepSeek tools no deepH \=** tool/function calling da DeepSeek mapeado para skills locais do runtime. A DeepSeek não executa seu filesystem diretamente.  
* **Para gerar arquivos de verdade**, habilite skills de filesystem (especialmente 'file\_write\_safe'). Sem skill de escrita, o agent só descreve/gera patch textual.  
* **Com 'local\_mock'**, você valida orquestração (trace/handoffs/channels). Para geração real, troque para DeepSeek e habilite skills apropriadas.  
* **O que melhorar depois:** Se você quiser transformar essa calculadora em algo confiável para produção, o próximo passo é implementar uma skill determinística de matemática (ex.: parser/eval) e manter o formatter como agent separado.