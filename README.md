# Arquivo GMS

Arquivo institucional navegável da **Global Monster Security**, em português brasileiro. Interface responsiva em JavaScript e CSS, com Vite. O editor permite salvar textos neste navegador sem banco de dados. Para publicar as mudanças para todos, a administração compartilhada usa uma função no Vercel e Upstash Redis.

## Executar

Requer Node.js 20.19+ ou 22.12+ (validado com Node 24).

```sh
npm ci --cache /tmp/gms-npm-cache
npm run dev
```

Para gerar a versão estática: `npm run build`. Para conferir essa versão: `npm run preview`. Para testar a administração, copie `.env.example` para `.env.local`, preencha as variáveis do servidor e use `npm run dev` ou `npm run preview`. Nunca coloque essas variáveis em campos com prefixo `VITE_`.

## Conteúdo

A fonte narrativa é o [documento fornecido, edição 1.7](https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit). Foram incorporados os 20 registros de espécies e a seção sobre a GMS. As descrições das espécies preservam o texto narrativo do documento; as capacidades foram sintetizadas como características naturais, sem dados, custos, níveis, atributos ou regras de jogo.

Cada registro de origem tem referência à seção consultada. Lendas e incertezas não são apresentadas como fatos confirmados. O documento apresenta duas medidas para a estatura das Fadas; a divergência foi registrada como informação não consolidada.

Os casos, a missão, os dois relatórios e o alvo público de demonstração foram removidos. A seção Investigações foi retirada da navegação. Os anexos reservados demonstrativos continuam identificados como não canônicos. Códigos de catálogo, departamentos, datas de incorporação e classificações de circulação são metadados desta versão do site.

## Editar ou adicionar arquivos

O conteúdo de referência está em **`src/data.js`** e os cadastros operacionais em **`src/operations.js`**, separados da interface (`src/main.js`) e do visual (`src/style.css`). Edite o objeto correspondente no array `records`. As propriedades principais são:

| Campo | Uso |
| --- | --- |
| `id` | Identificador único e estável, usado na URL e nos vínculos |
| `kind` | `verbete`, `documento`, `agente`, `missao`, `relatorio` ou `alvo` |
| `code`, `title`, `summary` | Código, título e resumo |
| `category` | Categoria usada nos filtros |
| `access` | `Público`, `Restrito` ou `Censurado` |
| `status`, `date` | Situação e data ISO `AAAA-MM-DD` |
| `author`, `department` | Metadados documentais |
| `report` | Array de parágrafos, em texto simples |
| `abilities` | Opcional: array de `{ title, text, stage }` com capacidades narrativas; `details` guarda desdobramentos e `variant`, a composição |
| `facts`, `hypotheses`, `unknown` | Arrays separados de fatos, hipóteses e lacunas |
| `people`, `locations`, `evidence` | Dados opcionais do caso |
| `timeline` | Opcional: array de `{ date, text }` |
| `related` | Array de IDs de outros registros para criar links clicáveis nas páginas que não são de espécies |
| `notableMembers` | Nas espécies, array de IDs dos membros notáveis; vazio exibe a mensagem de ausência de registros |
| `source`, `sourceSection`, `sourceUrl` | Indicação e referência à fonte narrativa |
| `demo` | Use `true` para sinalizar um caso não canônico |

Duplique um objeto do mesmo tipo, atribua um `id` e `code` únicos e atualize `related`. Para censurar um trecho visualmente, use `████████` no texto. Essa apresentação **não protege a informação**; não inclua material realmente secreto no código.

As categorias da wiki estão no array `categories`. Contagens, resultados e vínculos são calculados a partir dos registros. A seleção inicial de atualizações recentes é organizada no painel em `src/main.js`.

## Recursos e limites

- Busca integrada no título, código, descrição e capacidades; ignora maiúsculas e acentos.
- Filtros combináveis de situação, categoria e acesso, com estado vazio e opção de limpar.
- Dossiês com referências clicáveis, cronologia, evidências, capacidades, fatos e hipóteses.
- Arquivos salvos persistem no `localStorage` deste navegador.
- Navegação por URL com hash permite recarregar e compartilhar registros sem configurar rotas no servidor.
- Fontes locais: não dependem de requisições ao Google Fonts durante a navegação.
- As classificações e credenciais narrativas são demonstrativas e controlam a exibição pela interface. O login administrativo é separado e validado no servidor.
- O painel administrativo edita os documentos e salva cópias neste navegador. A publicação para todos depende do serviço compartilhado. Favoritos continuam locais ao navegador.
- O projeto está publicado no Vercel em `https://globalmonstersecurity.vercel.app`.

## Validação

`npm test` confere a integridade dos registros, a cobertura das 20 espécies, vínculos e a ausência de notações de regras nas capacidades. A versão também foi validada em Chromium, em computador e celular: busca, filtros combinados, leitura de todos os 29 dossiês, links, censura e persistência dos salvos. `npm run build` gera a distribuição estática.

## Prévia sem instalação

Para gerar um HTML único de visualização: `npm run preview:export`. Abra `preview/arquivo-gms.html` diretamente em um navegador de computador (Chrome, Edge ou Firefox). O arquivo reúne interface, conteúdo e fontes; busca, filtros e navegação funcionam sem internet e sem servidor. Visualizadores de anexos e a pré-visualização de arquivos de alguns celulares podem bloquear JavaScript; nesse caso, baixe o arquivo e abra no navegador.

A identidade visual usa o arquivo original da logo em `src/assets/gms-logo.png`, recuperado do documento de referência. O PNG foi preservado; a classe CSS `.gms-mark` ajusta somente a exibição para manter contraste no tema escuro. A exportação independente incorpora a logo e as fontes no HTML.


## Agentes, missões e alvos de interesse

### Painel operacional e pasta de trabalho

O painel inicial destaca as operações abertas, separa as missões encerradas e mostra a situação dos registros existentes. A área **Sua missão** permite acompanhar uma operação; a escolha também pode ser feita na própria ordem de missão. Ela reúne atalhos para a ordem, os relatórios e as anotações daquela operação. O acompanhamento é pessoal e não altera a equipe designada nem o andamento oficial da missão.

A **Pasta de trabalho** (`#/pasta-de-trabalho`) está disponível na navegação e no painel inicial. Crie anotações com título e texto, vincule-as a uma missão ou mantenha-as avulsas, filtre o caderno por missão, baixe cópias em `.txt` e exclua notas com confirmação. A digitação é salva automaticamente. A remoção de uma missão do acompanhamento preserva todas as anotações.

A pasta possui quatro abas: **Anotações**, **Documentos**, **Pessoas de interesse** e **Localidades**. Em Documentos, vincule arquivos disponíveis no acervo e acrescente observações pessoais. Pessoas de interesse aceita contatos cadastrados manualmente ou ligados a fichas existentes; Localidades guarda nome, referência ou coordenadas e observações. Todos os registros podem ser associados a uma missão, e o filtro é mantido ao trocar de aba. Os textos são salvos automaticamente; remover um registro pede confirmação e não altera o acervo oficial. As coleções novas usam a mesma chave de armazenamento e preservam as notas anteriores. A interface destas abas fica em `src/work-folder-sections.js`.

A seleção e as anotações usam `gms-work-folder-v1` no `localStorage`, sem banco ou envio para o servidor. Ficam apenas neste navegador e são removidas ao limpar os dados do site; mudar o nome do agente mantém o mesmo caderno do terminal. Se o armazenamento falhar, o site informa que o rascunho existe apenas na sessão e permite baixá-lo. A lógica de persistência fica em `src/work-folder.js`; os componentes em `src/operational-panel.js` e `src/operational-panel.css`. O painel usa os registros disponíveis para consulta e preserva a ocultação das fichas reservadas.

Os cadastros operacionais ficam em `src/operations.js`, incorporados automaticamente ao acervo e à busca global. O acervo inclui **Operação Sol Velado** (`MIS-561`), **Operação Último Sinal** (`MIS-568`) e **Sol Velado — relatório de Bashir** (`REL-561-001`), com vínculos entre os documentos e a ficha do agente. O relatório pertence à Operação Sol Velado e preserva o momento da narrativa: a missão já estava em andamento e a equipe encerra o registro a caminho da ilha. A situação atual de Sol Velado é “Contato perdido”; a busca pertence a Último Sinal.

O histórico também inclui três missões encerradas: **Repouso Violado** (`MIS-083`), **Rastro Cortado** (`MIS-247`) e **Olhar Fechado** (`MIS-416`). Cada missão tem relatórios inicial e de encerramento, com os códigos `REL-083-001`/`REL-083-002`, `REL-247-001`/`REL-247-002` e `REL-416-001`/`REL-416-002`. As missões, os relatórios e as fichas dos responsáveis mantêm vínculos clicáveis entre si. Esses registros são anteriores à operação atual na narrativa; suas datas no site indicam apenas a incorporação ao arquivo.

Direção para futuras narrativas: varie as espécies das equipes e dos envolvidos nos casos, distribuindo as operações conforme função, experiência e disponibilidade dos agentes. As ocorrências devem envolver criaturas e justificar a intervenção da G.M.S.

Os códigos de agentes e missões usam números variados e não consecutivos, para representar um recorte de um acervo maior. São identificadores fixos: não mudam ao recarregar o site. Para adicionar registros, escolha um código ainda não utilizado; os vínculos e as URLs continuam baseados em `id`.

Para editar uma missão, altere seus blocos `sections`: cada bloco tem `title` e `paragraphs`; `list: true` apresenta os objetivos como lista. O helper `mission()` gera `report` e `reportSections` automaticamente para manter a busca e a leitura organizadas. O relatório do Bashir usa diretamente o array `report`. As datas dos registros operacionais indicam sua incorporação ao arquivo, sem fixar datas para os acontecimentos da campanha.

- `kind: 'agente'`: ficha funcional; `profile` contém pares `{ label, value }` para identificação, espécie, função e lotação.
- `kind: 'missao'`: ordem operacional; `agentIds` liga a equipe e `targetIds` liga os alvos. Os relatórios são encontrados automaticamente por `missionId`.
- `kind: 'relatorio'`: documento operacional com `missionId` apontando para uma missão existente. O código segue `REL-{número da missão}-{número do relatório}`, com três dígitos em cada número: `REL-561-001` é o primeiro relatório de `MIS-561`, seguido por `REL-561-002`. A numeração dos relatórios começa em `001` para cada missão. Fica na subaba **Missões → Relatórios**, com filtro por missão; não se mistura à lista de documentos institucionais.
- `kind: 'alvo'`: indivíduo ou grupo de interesse investigativo. `profile`, `facts`, `hypotheses` e `unknown` permitem separar identidade, vínculos, suspeitas e informações confirmadas. A classificação não implica culpa.

Use `related` para acrescentar vínculos entre quaisquer arquivos. Remova `demo: true` apenas quando o registro representar conteúdo oficial. A rota `#/missoes/relatorios?missao=ID-DA-MISSAO` abre os relatórios de uma missão específica.

## Credenciais de acesso

O campo **Credenciais de acesso** fica na parte inferior do menu. Também há uma página própria, acessível pelo título desse campo ou pelo link no rodapé.

Códigos de demonstração (para quem organiza a campanha):

| Código | Conteúdo liberado |
| --- | --- |
| `GMS-ARQUIVO` | A aba **Arquivo reservado**, com dois documentos adicionais |
| `GMS-INTEL` | Um dossiê complementar em **Alvos de interesse** |
| `PAPÃO` | Sequência temporária de acesso negado, seguida de retorno ao painel |

A validação aceita diferenças de maiúsculas/minúsculas e espaços nas extremidades. A liberação é guardada neste navegador e os códigos já ativos não são registrados novamente. Se o navegador impedir o armazenamento, a autorização vale apenas durante a sessão e a interface informa isso. Na página de credenciais é possível consultar os acessos ativos e removê-los deste terminal.

A credencial **PAPÃO** mantém o acento e aceita variações de maiúsculas/minúsculas. Ela apresenta uma tela vermelha com um símbolo de erro no lugar da logo e a mensagem “Você não tem autorização para acessar este arquivo”. Após **8 segundos**, abre o pop-up **Redirecionando**, com carregamento de **1,5 segundo**, e retorna ao painel inicial com as cores normais. A sequência não salva uma autorização nem modifica o nome do agente, os favoritos ou os acessos já concedidos. Sua definição fica em `src/permissions.js`, com `effect: 'access-denied'`; o comportamento e os tempos ficam em `src/access-denied.js`, e o visual em `src/access-denied.css`. A navegação para outra página cancela a sequência e seus temporizadores.

Durante a tela de erro, letras e números vermelhos descem ao fundo, com linhas de varredura, cortes horizontais e distorções breves do título e da mensagem. A chuva de códigos é desenhada em `src/denied-visuals.js`, limitada a 20 quadros por segundo e com resolução ajustada à tela. A preferência por movimento reduzido apresenta os códigos estáticos e desativa os glitches. Ao começar o redirecionamento, as animações param; o retorno ou a saída da tela também descarta a animação, o observador de tamanho e o acompanhamento da preferência de movimento.

As definições ficam em **`src/permissions.js`**:

- `credentials`: altere `code` para mudar um código de demonstração; preserve o `id` se já houver registros vinculados.
- `reservedRecords`: exemplos de arquivos adicionais. `requiredGrant` é o `id` da credencial necessária; `collection: 'reservado'` associa um documento à coleção reservada.
- Para liberar um registro existente, acrescente `requiredGrant` com o ID correspondente. A mesma credencial pode liberar vários registros.
- A propriedade `route` indica a tela aberta depois de validar o código. Pode apontar para um registro com `#/arquivo/ID` ou para a coleção `#/reservado`.

A navegação, as contagens, os resultados de busca, os favoritos e os vínculos mostram somente os registros liberados. URLs de registros condicionados exibem a solicitação de credencial. A remoção de uma autorização volta a ocultar o conteúdo sem apagar os favoritos previamente salvos.

**Limite desta versão:** este é um mecanismo narrativo no frontend, sem proteção real de servidor. Os códigos e os textos estão incluídos no HTML/JavaScript e podem ser inspecionados. Não use as credenciais para proteger dados confidenciais reais. Todos os arquivos de demonstração liberados continuam identificados como não canônicos.

## Publicar no Vercel

Importe o repositório `vinnilanhouse-svg/G.M.S.` e selecione a branch `main`. Mantenha a pasta raiz em `./`. O arquivo `vercel.json` já configura o framework Vite, o comando `npm run build` e a saída `dist`.

A instalação usa o `package-lock.json`. A navegação do arquivo dispensa variáveis de ambiente; a administração usa as variáveis descritas abaixo. As rotas usam hash (`#/...`). O fallback de SPA em `vercel.json` permite que endereços inexistentes fora do hash também abram a tela de recuperação do C.O.D.E.X, preservando os caminhos `/api/`. A pasta `preview/` contém apenas exportações locais e não é necessária para a publicação.

## Imagens das espécies

As 20 espécies usam as ilustrações das respectivas seções do documento fornecido. Os arquivos ficam em `public/species/`, com versões WebP para as entradas e miniaturas para reutilização. As imagens são servidas pelo próprio site, sem depender de links temporários do Google Docs.

O mapeamento fica em `src/species-images.js` e cada entrada referencia sua imagem no campo `image` de `src/data.js`. Para substituir uma imagem, mantenha os caminhos ou atualize `src` e `thumbnail`, o texto alternativo e as dimensões no mapeamento. As entradas exibem a prancha completa e permitem ampliá-la; os cartões da Base de conhecimento usam os símbolos minimalistas das espécies, carregados conforme a navegação. O conteúdo e o enquadramento das ilustrações foram preservados na otimização para a web.

## Vinheta de entrada

Ao abrir ou recarregar o site, a vinheta exibe **Validando credenciais** em uma barra segmentada e, ao concluir, **Acesso permitido! Bem vindo agente!**. A validação leva 1,8 segundo; a mensagem permanece por 0,7 segundo e o fechamento leva 0,15 segundo (2,65 segundos no total). A vinheta não se repete na navegação entre abas e não altera as permissões narrativas existentes. É possível dispensá-la com Escape; a preferência por movimento reduzido mostra uma versão breve, sem animação da barra.

O comportamento e os tempos ficam em `src/entry-screen.js`; o visual usa as classes `.entry-screen` em `src/style.css`.

Os títulos das páginas de espécies usam as mesmas fontes do documento de referência. As associações e o tamanho dos títulos ficam em `src/species-typography.css`; as fontes são servidas junto com o site.

As habilidades das 20 espécies ficam em `src/species-abilities.js`, com os nomes do documento e descrições narrativas. `stage` distingue `initial` (iniciais), `acquired` (adquiridas) e `apex` (ápice da espécie). Os Constructos mantêm as variantes Carne, Metal e Barro. Os desdobramentos de uma habilidade ficam em `details`, como as quatro estações das Fadas e as manifestações de Linha de sangue dos Vampiros.

Para cadastrar um membro notável, crie seu registro e adicione o `id` ao array `notableMembers` da espécie em `src/data.js`. A página mostra links para os registros disponíveis no acesso atual.

Os históricos oficiais de agentes fornecidos pelo autor ficam em `src/agents.js`. As referências em `related` conectam as fichas entre si e às espécies; `notableMembers` em `src/data.js` controla a presença nas páginas de espécies. Miguel aparece entre Salamandras por classificação institucional; Bab’Din aparece entre Centauros pelo corpo atual, mantendo a origem de gênio em sua ficha. Os retratos dos agentes estão em `public/agents/`, associados em `src/agent-images.js` e referenciados no campo `image` das fichas. Eles aparecem no cartão lateral acima de Identificação e permitem ampliação.

Os ajustes gerais de contraste e tamanho de texto ficam em `src/readability.css`, aplicado após os estilos de layout e as fontes dos títulos das espécies.

Zaratha Khimer Atros consta apenas no diretório de agentes. A espécie Mantícora é informada na ficha como texto, sem criar entrada nem vínculo para uma espécie ausente do catálogo.

Nas listas, as espécies usam os símbolos originais dos cabeçalhos do documento, em `public/species-icons`, associados em `src/species-icons.js`. As fichas de agentes com vínculo em `notableMembers` usam o símbolo da espécie de referência; esse símbolo não é um retrato do agente. Agentes sem espécie catalogada conservam o ícone de agente, a menos que tenham um símbolo próprio no campo `icon`.

Os Constructos têm três símbolos originais diferentes no documento: Carne (costuras), Metal (placas regulares) e Barro (rachaduras). O mapa `constructIcons`, em `src/species-icons.js`, identifica cada variante. O campo `icon` de Nilo usa `constructIcons.barro`, o de C.O.D.E.X usa `constructIcons.metal` e o da ficha reservada de Morrow usa `constructIcons.carne`. A entrada geral de Constructos conserva o primeiro símbolo; a ficha de Morrow mantém as restrições de consulta existentes.

O símbolo próprio de Zaratha fica em `public/agent-icons/zaratha-manticora.webp`, referenciado no campo `icon` de sua ficha. Ele não cria uma espécie no catálogo. O perfil de agente de demonstração foi removido; as missões demonstrativas permanecem sem equipe designada.

Para substituir um retrato, troque o WebP correspondente em `public/agents/` ou atualize o caminho, o texto alternativo e as dimensões em `src/agent-images.js`. Os ícones das listas permanecem independentes dos retratos.

A credencial `NATHALISM0` (maiúsculas, com o número zero no final) abre diretamente a ficha de Morrow Noone. O registro fica em `src/private-agents.js`, com `requiredGrant` para condicionar a consulta e `unlisted: true` para excluí-lo do diretório, das buscas, dos favoritos, das contagens e das atualizações recentes, inclusive após a validação. O código é exigido a cada entrada: esta credencial não é salva, não cria um atalho em Credenciais de acesso e deixa de autorizar a ficha ao sair dela ou recarregar a página.

A credencial `GAMREBELLO`, em maiúsculas, abre a ficha de **Wanderley** com o mesmo funcionamento de consulta individual: fora das listas, buscas, favoritos e contagens, sem salvar a autorização e exigindo novamente o código após sair ou recarregar. A ficha fica em `src/private-agents.js`; histórico, espécie, cargo e retrato aguardam informações do autor. As duas credenciais reservadas autorizam apenas suas respectivas fichas.

O retrato de Morrow Noone usa o mesmo cartão lateral das demais fichas e está associado em `src/private-agents.js`; sua inclusão não altera o acesso exclusivo pelo código nem a exclusão das listagens.

Bashir está cadastrado em `src/agents.js`, com retrato em `src/agent-images.js`, e vinculado em `notableMembers` à entrada das Múmias.

Caio Lacerda (`AGT-205`), Dália Ferraz (`AGT-467`), Nilo Varela (`AGT-852`) e Lia Brandão (`AGT-394`) constam como agentes júniores. C.O.D.E.X (`AGT-906`), Constructo de Metal, é o responsável pelo Arquivo Central. As cinco fichas e seus retratos aprovados ficam em `src/agents.js`, `src/agent-images.js` e `public/agents/`. Os retratos aparecem no cartão lateral e podem ser ampliados; as listas usam os ícones das espécies. Os membros notáveis estão vinculados a Abissais (Caio), Centauros (Dália, junto de Bab’Din), Caiporas (Lia) e Constructos (Nilo e C.O.D.E.X). As variantes Barro e Metal são informadas nas fichas, dentro da entrada existente de Constructos.

Na primeira visita, a identificação pede o nome do agente antes da vinheta de validação. O nome é guardado na chave `gms-agent-name-v1` do `localStorage` e aparece no painel em “Acesso de agente”. A lógica fica em `src/agent-identity.js`, com estilos em `src/agent-identity.css`. O nome não concede credenciais, não altera o acesso à ficha de Morrow e é lembrado apenas neste navegador; ao limpar os dados do site ou usar outro navegador, o pedido reaparece.

No painel inicial, a sequência de teclas **↑ ↓ → → ←** abre a **Administração dos textos**. Ela é ignorada em outras páginas, durante a digitação e enquanto houver um diálogo aberto. A detecção fica em `src/admin-shortcut.js`. A troca de nome continua disponível pela credencial **NOME_ERRO**.

A credencial **NOME_ERRO**, exatamente em maiúsculas e com dois Rs, reabre a identificação, a partir do campo de credenciais em qualquer seção. O nome atual aparece preenchido; confirmar atualiza o nome local e cancelar preserva o anterior. O código não é guardado entre as autorizações ativas e não libera nenhum arquivo.

## Administração dos textos

No painel inicial, faça **↑ ↓ → → ←** para abrir diretamente o editor. No celular, use `#/administracao` e toque em **Abrir painel administrativo**. O painel contém somente a edição dos documentos; não há depuração, acompanhamento de visitantes ou coleta de nomes e presença.

### Salvar neste navegador

Sem o serviço compartilhado configurado, o editor funciona imediatamente em modo local. **Salvar neste navegador** atualiza a consulta do documento e guarda a edição em `gms-local-edits-v1` no `localStorage`. A mudança permanece ao recarregar a página e aparece em outras abas do mesmo navegador; outros navegadores e visitantes continuam vendo a versão publicada. Uma indicação de **Prévia local** permanece visível enquanto houver cópias locais salvas. **Restaurar versão do site** remove a cópia local daquele documento.

As edições locais respeitam as condições de acesso: fichas reservadas não aparecem no editor sem a credencial narrativa correspondente. Para editar uma delas localmente, abra a ficha pelo código e use **Editar esta página** na barra de edição. Sair da ficha volta a exigir o código, inclusive quando há uma cópia local. O nome de identificação, as credenciais e os favoritos não são alterados pelo editor.

Se o navegador bloquear o armazenamento ou ficar sem espaço, o painel informa que não salvou e mantém o texto no formulário. Limpar os dados do site apaga as cópias locais. Uma revisão local detecta alterações feitas por outra aba para evitar sobrescrever um texto mais recente.

### Publicar para todos pelo Vercel

1. No projeto da GMS no Vercel, abra **Storage / Marketplace**, adicione **Upstash Redis** e conecte o banco ao projeto.
2. Confira as variáveis criadas pela integração: `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. As variantes `KV_REST_API_URL` e `KV_REST_API_TOKEN` também são aceitas.
3. Em **Settings → Environment Variables**, adicione `GMS_ADMIN_PASSWORD` com uma senha exclusiva de **pelo menos 16 caracteres**. Use **Production**; configure Preview também se quiser testar deploys de prévia.
4. Faça **Redeploy**. Abra a administração e entre com a senha para usar **Publicar alterações**.

A senha e o token são usados somente no servidor, sem serem incluídos no JavaScript público ou guardados no `localStorage`. A sequência de setas permite editar uma cópia local; publicar no site exige uma sessão administrativa própria. A sessão usa cookie `HttpOnly`, `SameSite=Strict`, com duração de 8 horas; sair a revoga. A API confere a origem das alterações, limita tentativas de login e valida os campos publicados. Alterar a senha no servidor invalida as sessões existentes.

**Publicar alterações** grava os textos no Redis. Outros visitantes recebem a atualização na próxima sincronização (até 25 segundos, com a página visível) ou ao recarregar. Cópias locais têm prioridade apenas em seu navegador. Ao publicar um documento, a cópia local dele é substituída pela versão publicada, preservando as edições locais dos outros documentos. Publicações concorrentes usam uma revisão: um editor desatualizado recebe um conflito e mantém seu rascunho.

As edições publicadas têm prioridade sobre os textos dos arquivos do GitHub e persistem entre deploys. **Restaurar texto original**, no modo compartilhado, remove a edição do banco e volta à versão atual dos arquivos do projeto. Nenhum commit é criado ao publicar pelo painel. Mantenha backups do banco para preservar as edições compartilhadas.

### Campos disponíveis

Procure uma ficha, espécie, missão, relatório ou documento pelo nome, código ou seção. Edite título, resumo, situação, autoria, departamento, data, anotação e parágrafos. Os campos adicionais permitem editar capacidades e seus desdobramentos, dados funcionais, cronologia, pessoas, locais e evidências. Grupos de capacidades, imagens, códigos, IDs, vínculos e condições de acesso são preservados. A barra de edição oferece **Editar esta página** para abrir diretamente o documento atual.

Os textos fixos da navegação e do painel inicial continuam em `src/main.js`; o editor atua nos documentos do acervo. A prévia HTML independente permite consulta offline e edição local quando o navegador permite armazenamento, sem administrar o site publicado.

A implementação fica em `src/admin-panel.js`, `src/admin-panel.css`, `src/local-edits.js`, `src/content-editing.js`, `src/site-service.js`, `api/gms.js` e `server/`. `vite.config.js` disponibiliza a mesma API em desenvolvimento e na prévia servida por Vite. Os testes cobrem armazenamento local, autenticação da publicação, conflitos de revisão, restauração e preservação das condições de acesso.

## Tela de recuperação do C.O.D.E.X

Seções e fichas inexistentes, caminhos inválidos fora do hash e falhas de execução da interface exibem o C.O.D.E.X chibi com uma chave de fenda ao lado de um computador. A mensagem é “Ei, desculpa, acho que você se perdeu. Vou te mandar de volta para casa.” O botão **Voltar para a tela inicial** restaura a rota inicial, mantendo nome, favoritos e credenciais. Fichas existentes que exigem uma credencial continuam exibindo a solicitação de acesso.

Ao abrir ou recarregar o site, há **1% de chance** de entrar nessa mesma tela. O sorteio acontece uma vez na inicialização, sem se repetir ao trocar de seção, atualizar o nome ou usar o botão de retorno. A identificação da primeira visita continua funcionando normalmente. Não há retorno automático: a pessoa escolhe quando voltar pelo botão.

A resolução de rotas e a chance ficam em `src/routing.js`; a tela e seus estilos, em `src/lost-page.js` e `src/lost-page.css`. A ilustração minimalista usa apenas contornos verde-sálvia e fundo transparente, na paleta do site. Ela fica em `src/assets/codex-lost.webp`, importada no build e incluída também na prévia independente.
