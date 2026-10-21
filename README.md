# Arquivo GMS

Arquivo institucional navegável da **Global Monster Security**, em português brasileiro. Interface responsiva em JavaScript e CSS, com Vite; sem banco de dados ou servidor de aplicação.

## Executar

Requer Node.js 20.19+ ou 22.12+ (validado com Node 24).

```sh
npm ci --cache /tmp/gms-npm-cache
npm run dev
```

Para gerar a versão estática: `npm run build`. Para conferir essa versão: `npm run preview`.

## Conteúdo

A fonte narrativa é o [documento fornecido, edição 1.7](https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit). Foram incorporados os 20 registros de espécies, as seções do universo e da GMS e o Saci de olhos azuis, mencionado na fonte. As descrições das espécies preservam o texto narrativo do documento; as capacidades foram sintetizadas como características naturais, sem dados, custos, níveis, atributos ou regras de jogo.

Cada registro de origem tem referência à seção consultada. Lendas e incertezas não são apresentadas como fatos confirmados. O documento apresenta duas medidas para a estatura das Fadas; a divergência foi registrada como informação não consolidada.

Os três casos `INV-DEMO-*` são **exemplos não canônicos**, identificados no painel e no cabeçalho de cada dossiê. Os documentos internos são adaptações editoriais de trechos da fonte, não novos acontecimentos. Códigos de catálogo, departamentos, datas de incorporação e classificações de circulação são metadados desta versão do site.

## Editar ou adicionar arquivos

O conteúdo de referência está em **`src/data.js`** e os cadastros operacionais em **`src/operations.js`**, separados da interface (`src/main.js`) e do visual (`src/style.css`). Edite o objeto correspondente no array `records`. As propriedades principais são:

| Campo | Uso |
| --- | --- |
| `id` | Identificador único e estável, usado na URL e nos vínculos |
| `kind` | `verbete`, `documento`, `investigacao`, `agente`, `missao`, `relatorio` ou `alvo` |
| `code`, `title`, `summary` | Código, título e resumo |
| `category` | Categoria usada nos filtros |
| `access` | `Público`, `Restrito` ou `Censurado` |
| `status`, `date` | Situação e data ISO `AAAA-MM-DD` |
| `author`, `department` | Metadados documentais |
| `report` | Array de parágrafos, em texto simples |
| `abilities` | Opcional: array de `{ title, text }` com capacidades narrativas |
| `facts`, `hypotheses`, `unknown` | Arrays separados de fatos, hipóteses e lacunas |
| `people`, `locations`, `evidence` | Dados opcionais do caso |
| `timeline` | Opcional: array de `{ date, text }` |
| `related` | Array de IDs de outros registros para criar links clicáveis |
| `source`, `sourceSection`, `sourceUrl` | Indicação e referência à fonte narrativa |
| `demo` | Use `true` para sinalizar um caso não canônico |

Duplique um objeto do mesmo tipo, atribua um `id` e `code` únicos e atualize `related`. Para censurar um trecho visualmente, use `████████` no texto. Essa apresentação **não protege a informação**; não inclua material realmente secreto no código.

Os comunicados estão no array `notices`; as categorias da wiki, em `categories`. Contagens, resultados e vínculos são calculados a partir dos registros. A seleção inicial de atualizações recentes é organizada no painel em `src/main.js`.

## Recursos e limites

- Busca integrada no título, código, descrição e capacidades; ignora maiúsculas e acentos.
- Filtros combináveis de situação, categoria e acesso, com estado vazio e opção de limpar.
- Dossiês com referências clicáveis, cronologia, evidências, capacidades, fatos e hipóteses.
- Arquivos salvos persistem no `localStorage` deste navegador.
- Navegação por URL com hash permite recarregar e compartilhar registros sem configurar rotas no servidor.
- Fontes locais: não dependem de requisições ao Google Fonts durante a navegação.
- As classificações e credenciais são demonstrativas: não há login nem autorização em servidor; o conteúdo adicional é ocultado ou exibido pela interface.
- Esta versão não permite edição pela interface e não sincroniza favoritos entre dispositivos.
- Nenhuma hospedagem ou publicação foi configurada.

## Validação

`npm test` confere a integridade dos registros, a cobertura das 20 espécies, vínculos e a ausência de notações de regras nas capacidades. A versão também foi validada em Chromium, em computador e celular: busca, filtros combinados, leitura de todos os 29 dossiês, links, censura e persistência dos salvos. `npm run build` gera a distribuição estática.

## Prévia sem instalação

Para gerar um HTML único de visualização: `npm run preview:export`. Abra `preview/arquivo-gms.html` diretamente em um navegador de computador (Chrome, Edge ou Firefox). O arquivo reúne interface, conteúdo e fontes; busca, filtros e navegação funcionam sem internet e sem servidor. Visualizadores de anexos e a pré-visualização de arquivos de alguns celulares podem bloquear JavaScript; nesse caso, baixe o arquivo e abra no navegador.

A identidade visual usa o arquivo original da logo em `src/assets/gms-logo.png`, recuperado do documento de referência. O PNG foi preservado; a classe CSS `.gms-mark` ajusta somente a exibição para manter contraste no tema escuro. A exportação independente incorpora a logo e as fontes no HTML.


## Agentes, missões e alvos de interesse

Os cadastros das novas áreas ficam em `src/operations.js`, incorporados automaticamente ao acervo e à busca global. Há modelos não canônicos de agente, missão, relatórios e alvo; substitua os textos pelos dados oficiais da campanha.

- `kind: 'agente'`: ficha funcional; `profile` contém pares `{ label, value }` para identificação, espécie, função e lotação.
- `kind: 'missao'`: ordem operacional; `agentIds` liga a equipe e `targetIds` liga os alvos. Os relatórios são encontrados automaticamente por `missionId`.
- `kind: 'relatorio'`: documento operacional com `missionId` apontando para uma missão existente. Fica na subaba **Missões → Relatórios**, com filtro por missão; não se mistura à lista de documentos institucionais.
- `kind: 'alvo'`: indivíduo ou grupo de interesse investigativo. `profile`, `facts`, `hypotheses` e `unknown` permitem separar identidade, vínculos, suspeitas e informações confirmadas. A classificação não implica culpa.

Use `related` para acrescentar vínculos entre quaisquer arquivos. Remova `demo: true` apenas quando o registro representar conteúdo oficial. A rota `#/missoes/relatorios?missao=ID-DA-MISSAO` abre os relatórios de uma missão específica.

## Credenciais de acesso

O campo **Credenciais de acesso** fica na parte inferior do menu. Também há uma página própria, acessível pelo título desse campo ou pelo link no rodapé.

Códigos de demonstração (para quem organiza a campanha):

| Código | Conteúdo liberado |
| --- | --- |
| `GMS-ARQUIVO` | A aba **Arquivo reservado**, com dois documentos adicionais |
| `GMS-INTEL` | Um dossiê complementar em **Alvos de interesse** |

A validação aceita diferenças de maiúsculas/minúsculas e espaços nas extremidades. A liberação é guardada neste navegador e os códigos já ativos não são registrados novamente. Se o navegador impedir o armazenamento, a autorização vale apenas durante a sessão e a interface informa isso. Na página de credenciais é possível consultar os acessos ativos e removê-los deste terminal.

As definições ficam em **`src/permissions.js`**:

- `credentials`: altere `code` para mudar um código de demonstração; preserve o `id` se já houver registros vinculados.
- `reservedRecords`: exemplos de arquivos adicionais. `requiredGrant` é o `id` da credencial necessária; `collection: 'reservado'` associa um documento à coleção reservada.
- Para liberar um registro existente, acrescente `requiredGrant` com o ID correspondente. A mesma credencial pode liberar vários registros.
- A propriedade `route` indica a tela aberta depois de validar o código. Pode apontar para um registro com `#/arquivo/ID` ou para a coleção `#/reservado`.

A navegação, as contagens, os resultados de busca, os favoritos e os vínculos mostram somente os registros liberados. URLs de registros condicionados exibem a solicitação de credencial. A remoção de uma autorização volta a ocultar o conteúdo sem apagar os favoritos previamente salvos.

**Limite desta versão:** este é um mecanismo narrativo no frontend, sem proteção real de servidor. Os códigos e os textos estão incluídos no HTML/JavaScript e podem ser inspecionados. Não use as credenciais para proteger dados confidenciais reais. Todos os arquivos de demonstração liberados continuam identificados como não canônicos.

## Publicar no Vercel

Importe o repositório `vinnilanhouse-svg/G.M.S.` e selecione a branch `main`. Mantenha a pasta raiz em `./`. O arquivo `vercel.json` já configura o framework Vite, o comando `npm run build` e a saída `dist`.

A instalação usa o `package-lock.json`. Não é necessário configurar variáveis de ambiente nesta versão. As rotas usam hash (`#/...`), portanto não precisam de redirecionamento de SPA no servidor. A pasta `preview/` contém apenas exportações locais e não é necessária para a publicação.
