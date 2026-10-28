# Arquivo GMS

Ideias escolhidas para implementar depois estão em [IDEIAS.md](IDEIAS.md).

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

### Minha ficha de agente

A aba **Minha ficha de agente** (`#/minha-ficha`) reproduz os **215 campos editáveis**, os **63 cálculos** e os gráficos das três páginas de `Ficha_Monstrao_Automatica_Editavel.pdf`. A definição tem 28 perícias, 11 linhas de habilidades, 11 de ataques e 26 de inventário. O preenchimento é pessoal, salvo automaticamente em `gms-agent-sheet-v1` no navegador; integra uma ficha própria, sem criar um registro no diretório de agentes.

As fórmulas, as opções e a validação foram extraídas do AcroForm. Vida máxima é `20 + 2 × Corpo + Nível`; Essência máxima é `2 × Alma + Nível`; para Constructo de Metal, o recurso é Energia, com máximo `2 × Nível + Coração`. A base de Sorte é editável e Leprechaun recebe bônus automático de 5. A curva de P.E. é a do arquivo, incluindo o valor 0 nos níveis 1 e 20. Atributos aceitam valores de 0 a 20, inclusive decimais; nível aceita inteiros de 1 a 20. Recursos atuais continuam sob preenchimento manual. Peso máximo usa `2 × Corpo`, e o peso total soma as 26 linhas com o arredondamento original. Habilidades, ataques e especialidades preservam o preenchimento previsto no PDF.

**Exportar PDF** preenche o próprio PDF original, mantendo as três páginas, a arte, os campos editáveis, as opções, as validações, os scripts e os estados gráficos. O modelo de 27 MB só é carregado ao exportar; o processamento ocorre no navegador. **Importar ficha** lê os campos do PDF editável ou de um backup JSON, mostra a identificação para conferência e substitui a ficha após a confirmação no diálogo. PDFs sem os campos do formulário, como arquivos convertidos em imagens, são recusados. Os totais são recalculados pelos campos de entrada. O limite da importação de PDF é 64 MB; JSON, 20 MB. **Backup JSON** guarda os campos para recuperação. Os dados do personagem não são enviados ao servidor.

A quarta aba, **Central de rolagens** (`#/minha-ficha?aba=rolagens`), permite rolar d4, d6, d8, d10, d12, d20 e d100, repetir o último dado e limpar o histórico das últimas 20 rolagens. Cada clique consulta `crypto.getRandomValues` com rejeição da sobra de divisão, garantindo a mesma probabilidade para todas as faces; não há alternativa com `Math.random`. O resultado é sorteado no clique e revelado após uma breve animação de terminal. O histórico permanece ao navegar nas abas durante a sessão e é apagado ao recarregar ou fechar a página. Não altera os campos ou cálculos da ficha e não integra o PDF nem o backup JSON. A implementação fica em `src/agent-sheet-rolls.js` e `src/agent-sheet-rolls.css`.

Os nomes dos cinco atributos e das 28 perícias são botões de teste com d20. O resultado abre em um diálogo na própria ficha, com o dado, o valor usado, a composição da perícia e o veredito, e entra no histórico compartilhado da Central de rolagens. **Rolar novamente** consulta os valores atuais da ficha e uma nova amostra segura. Atributos usam seu valor; perícias usam o total recalculado (base + bônus), incluindo a Sorte própria e o bônus de Leprechaun. Resultado menor é sucesso, igual é sucesso crítico, maior é falha. Nos testes de ataque de Luta, Pontaria e Magia, 20 natural tem prioridade como falha crítica. Nos testes gerais, o capítulo de atributos permite crítico com valor 20; não se adiciona falha automática ou crítico no 1. Perícias marcadas com asterisco exigem treinamento, representado pelo bônus positivo da ficha, e não consomem uma rolagem enquanto ele não estiver registrado. As regras vêm das seções 3.1, 5 e 6.2 do [documento de referência](https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit). A interpretação das rolagens fica em `src/agent-sheet-checks.js`. Os testes são simples; efeitos contextuais de habilidades continuam sob os valores e a interpretação da mesa. As rolagens não alteram a ficha nem entram no PDF ou no backup.

A apresentação das rolagens usa um dado em contorno, anéis de leitura, grade discreta, varredura e medidor segmentado nos tons do arquivo, tanto no diálogo de teste quanto nos dados avulsos. Cada animação sorteia uma duração independente entre 3.000 e 8.000 ms, inclusive, usando o gerador seguro do navegador; o medidor, os efeitos e as fases acompanham o mesmo tempo. O dado é sorteado uma única vez e o número e o veredito são revelados ao terminar; não há números falsos intermediários ou novo sorteio na revelação. Durante a animação, os controles de rolagem ficam temporariamente desativados para evitar duplicação. Fechar o diálogo ou navegar preserva o resultado já sorteado no histórico da sessão. `prefers-reduced-motion` mostra o resultado imediatamente, inclusive se a preferência for ativada durante uma rolagem. Timers e observadores são removidos ao concluir, fechar ou substituir a apresentação.

A interface fica em `src/agent-sheet.js` e `src/agent-sheet.css`; as regras e a persistência, em `src/agent-sheet-model.js`; o preenchimento e a leitura de PDF, em `src/agent-sheet-pdf.js`, carregado sob demanda. O modelo original fica em `public/agent-sheet/`, junto da fonte de apoio para caracteres Unicode e sua licença. O SHA-256 do modelo é registrado em `src/agent-sheet-schema.js`. Para atualizar a referência, execute `python3 scripts/extract-agent-sheet.py CAMINHO_DO_PDF` (requer `pypdf` para esta regeneração). Os testes comparam os resultados do site aos scripts originais do PDF e verificam o ciclo PDF → site → PDF, a preservação das páginas e das aparências gráficas.

### Painel operacional e pasta de trabalho

O painel inicial destaca as operações abertas, separa as missões encerradas e mostra a situação dos registros existentes. A área **Sua missão** permite acompanhar uma operação; a escolha também pode ser feita na própria ordem de missão. Ela reúne atalhos para a ordem, os relatórios e as anotações daquela operação. O acompanhamento é pessoal e não altera a equipe designada nem o andamento oficial da missão.

A **Pasta de trabalho** (`#/pasta-de-trabalho`) está disponível na navegação e no painel inicial. Crie anotações com título e texto, vincule-as a uma missão ou mantenha-as avulsas, filtre o caderno por missão, baixe cópias em `.txt` e exclua notas com confirmação. A digitação é salva automaticamente. A remoção de uma missão do acompanhamento preserva todas as anotações.

A pasta possui oito seções: **Anotações**, **Andamento pessoal**, **Documentos**, **Pessoas de interesse**, **Localidades**, **Quadro de evidências**, **Buscar na pasta** e **Lixeira**. No celular, um seletor compacto substitui a lista de abas e permanece acessível durante a rolagem. Os botões principais do quadro também permanecem à mão; **Ferramentas do quadro** abre histórico, exportação, visualização e zoom. No computador, os controles ficam expostos. A navegação e os estilos ficam em `src/work-folder-sections.js` e `src/work-folder-navigation.css`. Em Documentos, vincule arquivos disponíveis no acervo e acrescente observações pessoais. Pessoas de interesse aceita contatos cadastrados manualmente ou ligados a fichas existentes; Localidades guarda nome, referência ou coordenadas e observações. Todos os registros podem ser associados a uma missão, e o filtro é mantido ao trocar de seção. Os textos são salvos automaticamente; remover um registro pede confirmação e não altera o acervo oficial. As coleções novas usam a mesma chave de armazenamento e preservam as notas anteriores.

O **Quadro de evidências** (`#/pasta-de-trabalho?aba=evidencias`) reúne automaticamente documentos, pessoas, localidades e anotações da pasta em cartões. **Adicionar evidência** cria esses mesmos registros diretamente pelo quadro. **Criar ligação** permite escolher duas evidências, descrever a relação, acrescentar fundamentação e distinguir **Hipótese** de **Confirmada pelo agente**. A confirmação representa a análise pessoal; não muda os fatos do acervo. Arraste pela alça dos cartões ou use as setas com a alça selecionada (Shift move 50 px em vez de 10 px); **Organizar cartões em colunas** restaura a disposição automática. Posições e ligações são salvas. A visualização **Lista**, padrão no celular, oferece as mesmas consultas e edições. Cada cartão abre observações, ligações e atalhos para o registro da pasta e para a ficha disponível no acervo. As ligações também aparecem em uma lista legível abaixo do quadro, com edição e remoção mediante confirmação. A implementação fica em `src/evidence-board.js`, `src/evidence-board.css` e `src/evidence-board-model.js`.

Para criar uma ligação diretamente, clique em **Criar ligação**, selecione o primeiro e o segundo cartão e preencha a descrição no diálogo. A ligação só é registrada ao salvar. Clicar novamente no primeiro cartão desfaz a seleção; **Cancelar seleção** ou Escape sai do modo. **Escolher pela lista** oferece os seletores de evidências, e a seleção direta também funciona na visualização Lista, pelo teclado e por toque. Os controles **−**, **percentual** e **+** ajustam o zoom; clicar no percentual restaura 100%. **Centralizar tudo** enquadra os cartões sem alterar suas posições, inclusive após movê-los para longe. O arraste considera a escala, enquanto as setas continuam movendo nas coordenadas do quadro. Zoom e enquadramento são mantidos durante a navegação da sessão por missão; ao recarregar, o quadro é enquadrado novamente. A câmera fica em `src/evidence-viewport.js`.

**Desfazer / Refazer** guarda as últimas 50 ações do quadro durante a sessão: movimentar/organizar cartões, adicionar evidências completas, criar/editar/remover ligações e enviar/restaurar notas da lixeira. Ctrl/Cmd+Z desfaz; Ctrl/Cmd+Shift+Z e Ctrl+Y refazem, enquanto o quadro está aberto. Campos de texto e diálogos mantêm seu comportamento nativo. O histórico aplica somente os campos afetados pela ação, preservando outras alterações e recusando conflitos com outra aba. Ele não entra nas exportações e é reiniciado ao recarregar. A implementação fica em `src/work-folder-history.js`; a criação de evidências usa uma transação única, com reversão completa se algum campo falhar.

**Lixeira** (`#/pasta-de-trabalho?aba=lixeira`) guarda as anotações removidas a partir desta versão, com texto, imagens, etiquetas, posição e suas ligações. Restaurar devolve a nota ao caderno e recupera vínculos cujas duas evidências estejam disponíveis. Se duas notas relacionadas forem removidas, restaurá-las em qualquer ordem recupera a ligação ao final. Um ID em conflito gera uma cópia, preservando a versão ativa. **Excluir definitivamente** exige confirmação e remove também do histórico as ações que poderiam recuperar essa nota. Não há limpeza automática. A lixeira é persistida em `gms-work-folder-v1`, incluída na cópia JSON e compatível com importações antigas sem essa coleção; a versão TXT e a busca de ativos não incluem seu conteúdo. A interface fica em `src/work-folder-trash.js`.

**Exportar quadro**, nas ferramentas, prepara uma cópia visual de todas as evidências do filtro atual, independentemente do zoom. A prévia, a imagem **PNG** e o **PDF** têm a mesma aparência: cortiça com moldura de madeira, cartões de papel, alfinetes e fios vermelhos, com índice de ligações. Textos longos são resumidos nos cartões; imagens escolhidas e retratos disponíveis são incorporados localmente. O PDF contém essa mesma composição em uma página, proporcional ao quadro. A arte mantém suas cores de cortiça em todas as paletas do terminal. A geração ocorre no navegador, sem enviar o caderno a um serviço, e o leitor de PDF só é carregado ao exportar. `src/evidence-board-export.js` desenha o quadro; `src/board-export-ui.js` e `src/board-export.css` cuidam da prévia e dos downloads. O arquivo JSON continua sendo o formato para recuperar os registros completos.

**Buscar na pasta** (`#/pasta-de-trabalho?aba=busca`) consulta títulos, observações, nomes, códigos de documentos vinculados, referências, coordenadas, imagens escolhidas, objetivos, pendências, rascunhos de retorno e ligações. Há um atalho de busca em cada aba da pasta. A consulta ignora acentos e maiúsculas e combina os termos digitados; filtros por missão, tipo e etiqueta podem ser usados juntos. Os resultados mostram um trecho relevante e abrem o registro correspondente para consulta ou edição. Consulta e filtros ficam na URL para permitir recarregar a página. Essa busca é pessoal, separada da busca global do acervo, e preserva a ocultação das fichas reservadas. A implementação fica em `src/work-folder-search.js`, `src/work-folder-search-ui.js` e `src/work-folder-search.css`.

Notas, documentos, pessoas, localidades e andamentos pessoais aceitam **até oito etiquetas de 32 caracteres**, separadas por vírgulas no campo Etiquetas. Elas podem ser editadas nos registros e nos cartões do quadro; a criação de evidência também aceita etiquetas. Repetições que diferem apenas por acentos ou maiúsculas são unificadas. Os resultados oferecem etiquetas clicáveis e filtro próprio. As etiquetas são locais, salvas automaticamente e incluídas nas cópias JSON e TXT; registros antigos continuam compatíveis. Seu editor fica em `src/folder-tags-ui.js` e a persistência usa a chave existente da pasta.

As **Anotações** aceitam até **quatro imagens do catálogo**, escolhidas em **Imagens da anotação → Escolher imagens**. A opção aparece no editor de notas, ao adicionar uma anotação pelo quadro e ao abrir um cartão existente. A biblioteca tem busca sem distinção de acentos e filtros **Criaturas**, **Países** e **Mundo**; aplicar salva a seleção, cancelar a mantém intacta. As miniaturas aparecem no cartão e podem ser removidas ou substituídas sem apagar o texto. O catálogo inclui os símbolos das 20 espécies existentes, as variantes Metal e Barro dos Constructos (Carne usa seu símbolo original), a Mantícora e o planeta Terra. Nenhuma espécie ou ficha nova é criada por escolher uma imagem. As escolhas usam IDs locais em `illustrations`, preservados na exportação/importação JSON; as versões TXT identificam as imagens pelo nome. Notas antigas continuam compatíveis. A biblioteca fica em `src/evidence-illustrations.js`; o seletor, em `src/note-illustration-picker.js` e `src/note-illustrations.css`.

Os **20 países** são Brasil, Argentina, Chile, México, Estados Unidos, Canadá, Portugal, Espanha, França, Alemanha, Itália, Reino Unido, Egito, África do Sul, China, Índia, Japão, Rússia, Austrália e Nova Zelândia. Seus símbolos e a Terra são vetores em contorno que acompanham a paleta escolhida. Os mapas são locais e esquemáticos, gerados dos dados Natural Earth 1:110m, em [domínio público](https://www.naturalearthdata.com/about/terms-of-use/); EUA e França usam o território continental principal. `src/country-icons.js` guarda as formas e pode ser regenerado com `python3 scripts/build-country-icons.py` (Python padrão, acesso à fonte apenas durante a geração). O site não consulta nenhum serviço de mapas para mostrar esses ícones.

**Exportar pasta**, disponível em todas as abas, baixa a pasta completa ou os registros do filtro atual. A cópia em **JSON** preserva todas as coleções, o andamento pessoal, as datas, a missão em acompanhamento, as posições dos cartões e suas ligações para recuperação posterior; o arquivo em **TXT** organiza o conteúdo para leitura, incluindo nomes, códigos, relações entre evidências e links dos arquivos acessíveis no terminal. Uma ligação só entra no filtro ou na exportação de missão quando suas duas evidências estão presentes. Remover um registro da pasta também remove suas ligações; as demais evidências são preservadas. A exportação guarda os vínculos com o acervo e suas observações, sem copiar o conteúdo integral dos documentos oficiais. Não inclui o nome de identificação, credenciais ou dados administrativos.

Para recuperar a pasta ou levá-la a outro navegador, use **Importar pasta**, selecione o JSON exportado e confira as contagens antes de adicionar os registros. A importação mantém o conteúdo local, ignora cópias idênticas e preserva versões diferentes como novos registros. Ao copiar evidências com IDs em conflito, suas ligações são remapeadas para as cópias corretas. Cópias antigas, sem quadro, continuam compatíveis. A missão em acompanhamento só é recuperada se o navegador ainda não tiver uma selecionada. Arquivos inválidos são recusados por inteiro; o limite é 20 MB. Os dados continuam locais ao navegador e não são enviados ao servidor. As funções de transferência ficam em `src/work-folder-backup.js` e `src/work-folder-transfer.js`.

A seleção e as anotações usam `gms-work-folder-v1` no `localStorage`, sem banco ou envio para o servidor. Ficam apenas neste navegador e são removidas ao limpar os dados do site; mudar o nome do agente mantém o mesmo caderno do terminal. Se o armazenamento falhar, o site informa que o rascunho existe apenas na sessão e permite baixá-lo. A lógica de persistência fica em `src/work-folder.js`; os componentes em `src/operational-panel.js` e `src/operational-panel.css`. O painel usa os registros disponíveis para consulta e preserva a ocultação das fichas reservadas.

O **Andamento pessoal**, também acessível por **Sua missão** no painel e pela ordem operacional, permite iniciar um caderno para cada missão. Os objetivos são copiados da ordem, sem alterar o documento oficial; é possível concluí-los, acrescentar objetivos, registrar questões pendentes e escrever um rascunho de relatório de retorno. A etapa pessoal pode ser Preparação, Em campo, Aguardando apoio, Em retirada ou Retorno concluído. O progresso integra as exportações JSON/TXT e a importação; cópias antigas continuam compatíveis. Versões diferentes importadas ficam disponíveis no seletor do acompanhamento. A implementação fica em `src/mission-progress.js` e a persistência continua na mesma chave da pasta.

As fichas exibem **Rastros de circulação**, com protocolo, data de incorporação, autoria, departamento, custódia por C.O.D.E.X., versão em consulta e identificação da consulta atual. Esses dados vêm do próprio registro e das edições presentes no terminal; a interface não inventa revisões históricas. O componente fica em `src/archive-trace.js`.

Alguns documentos também exibem **Notas do arquivista**, comentários narrativos de C.O.D.E.X com sugestões de leitura cruzada e questões já presentes nos registros. Não são análises automáticas nem acrescentam acontecimentos à campanha. Edite os textos e as referências no mapa `src/codex-annotations.js`; `src/codex-annotations.css` define a apresentação nas margens do relatório. As referências só aparecem quando o arquivo está disponível e listado; fichas reservadas não recebem comentários por esse mecanismo.

As notas usam um ícone do rosto chibi de C.O.D.E.X, derivado da ilustração da página não encontrada. O arquivo transparente e otimizado fica em `public/agent-icons/codex-chibi-face.webp`; os contornos acompanham a cor de destaque da paleta por máscara CSS, com imagem de apoio para navegadores sem esse recurso. A miniatura tem descrição acessível e também é incorporada na prévia independente.

A faixa do terminal mostra consultas e carregamentos por até 220 ms, sem bloquear a leitura. O movimento reduzido elimina a transição. **Som: desativado** permite ativar os efeitos **somente das rolagens de dados**; navegação, cliques, imagens, salvamentos e credenciais são silenciosos. A preferência continua em `gms-terminal-sound-v1` e sincroniza entre abas. O sintetizador compartilhado, em `src/terminal-sound.js`, usa Web Audio e preserva o ganho mestre de **1,5**, com volume 50% maior. O contexto só é criado após interação; indisponibilidade de áudio não interrompe a interface. A faixa e o controle de som ficam em `src/terminal-interface.js`.

Nas rolagens, pulsos eletrônicos acompanham a animação de 3 a 8 segundos, com um sinal próprio na revelação: resultado avulso, sucesso, falha, sucesso crítico ou falha crítica. Os efeitos não consultam o gerador aleatório e não alteram resultados ou durações. Com movimento reduzido, o resultado e seu sinal são imediatos, sem sequência de processamento. Fechar, trocar de página ou ocultar a aba interrompe o processamento; cancelar a apresentação não reproduz um resultado atrasado. Desativar o som silencia as notas em andamento e os sinais futuros; a preferência vale para todos os efeitos. Os nós de áudio são liberados ao terminar.

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

As credenciais **AZUL**, **VERDE**, **ROSA**, **VERMELHO**, **LARANJA**, **BRANCO**, **PRETO** e **ROXO** alteram a paleta completa do terminal. BRANCO é um tema claro; PRETO é monocromático; os demais usam fundos escuros com a cor correspondente. A escolha é lembrada em `gms-terminal-theme-v1`, separada das autorizações, e sincronizada entre abas. O campo da barra lateral e o da central de credenciais aceitam as cores. **Aparência deste terminal**, na central, mostra a escolha atual e permite **Restaurar paleta original**. Com armazenamento bloqueado, a mudança continua disponível na sessão e a interface informa que não pôde salvar. As credenciais de cor não liberam registros nem aparecem entre as autorizações ativas.

As paletas e a persistência ficam em `src/terminal-theme.js`, com ajustes em `src/theme-palettes.css`. O processador `scripts/theme-colors.mjs`, configurado no Vite, transforma as cores de todos os componentes em tokens durante o desenvolvimento e o build, conservando o valor original como fallback quando nenhuma paleta está ativa. Fundos, bordas, textos, controles, janelas e as rolagens acompanham a escolha; imagens, estilos de impressão e a sequência vermelha do PAPÃO preservam seus valores próprios. O retorno do PAPÃO restaura a paleta escolhida. As cores de texto têm contraste mínimo de 4,5:1 nas superfícies de cada paleta; os testes também verificam controles, preferências inválidas e ausência de concessão de acesso.

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

## Relatórios pessoais, credencial e grifos

**Pasta de trabalho → Relatórios pessoais** (`#/pasta-de-trabalho?aba=relatorios`) reúne o montador de relatórios de campo. Crie um relatório avulso ou vinculado a uma missão, preencha a identificação e as seções de objetivos, relato, constatações, hipóteses, conclusão e referências. **Reunir registros da pasta** permite escolher notas, documentos, pessoas e localidades da missão e acrescentá-los integralmente a uma seção, preservando o texto existente. Documentos indisponíveis e metadados de agentes ocultos não entram na seleção. Os arquivos e ordens originais continuam no acervo; concluir o relatório pessoal não o publica.

A exportação gera um **PDF A4 editável**, com emblema, cabeçalho, margens, identificação funcional, classificação e páginas numeradas. O documento conserva os textos completos em campos AcroForm, distribuídos por páginas; não transforma o conteúdo em imagem. **Importar relatório** aceita esse PDF (até 12 MB) e o backup JSON individual (até 2 MB), mostrando uma conferência antes de criar uma **nova cópia**. Textos alterados em leitores externos são lidos dos campos. PDFs achatados, digitalizados, protegidos por senha ou de outros modelos são recusados; não há OCR nem execução de ações ou scripts do PDF. `src/field-report-model.js`, `src/field-reports.js` e `src/field-report-pdf.js` concentram dados, interface e diagramação. Registros ficam em `gms-field-reports-v1`; exporte cada relatório pelo próprio montador. O backup anterior da pasta continua reunindo notas, andamento, vínculos, quadro e lixeira.

**Minha credencial** (`#/minha-credencial`, também acessível pela ficha) permite definir nome, codinome, espécie, matrícula, cargo, departamento, emissão e retrato. Pode preencher a identidade a partir da ficha sem modificar suas mecânicas. A credencial exporta **PNG ou PDF**, com aparência de identificação institucional. PNG/JPG/WebP de até 8 MB e 25 megapixels são reduzidos localmente para um retrato JPEG de 360 × 480; não são enviados a um servidor. Configuração e imagem ficam em `gms-personal-credential-v1`. A identidade é narrativa: não concede permissões, não cria um agente no diretório e não altera o nome de acesso ao terminal. Novos relatórios usam o nome e a matrícula da credencial, quando preenchida.

Nos dossiês públicos, selecione um trecho de **um mesmo parágrafo** e use **Grifar seleção**. Um botão aparece junto à seleção ativa; em **Grifos pessoais**, registre comentários e escolha Destaque, Dúvida ou Atenção. Clicar no grifo abre sua anotação; **Localizar trecho** retorna ao parágrafo. Os dados ficam em `gms-document-highlights-v1`, sem alterar o conteúdo original. As âncoras guardam trecho, posição e contexto: se o texto mudar e não houver correspondência inequívoca, a anotação continua nas margens, com aviso, sem grifar outra frase. Não há grifos em perfis ocultos. `src/document-highlights-model.js` e `src/document-highlights.js` controlam esse recurso.

Os três recursos são pessoais e locais ao navegador. O salvamento verifica os campos alterados para não sobrescrever uma edição concorrente da mesma informação em outra aba. Se o armazenamento estiver bloqueado ou cheio, a interface informa que o registro ficou apenas na sessão; relatórios e credenciais continuam podendo ser exportados.

## Organização da pasta de trabalho

A navegação da pasta está agrupada em **Anotações**, **Quadro**, **Referências**, **Relatórios** e **Minha missão**. Referências reúne Documentos, Pessoas de interesse e Localidades. As URLs anteriores continuam funcionando; no celular, um seletor agrupado dá acesso a todas as seções. **Mais opções** concentra exportação, importação, busca com filtros e lixeira.

As anotações abrem com título e texto; missão, imagens e etiquetas ficam em **Imagens e organização**, e download/exclusão em **Opções da anotação**. Referências mostram o resumo do registro antes do formulário **Editar registro**. Os links diretos para registros e os itens recém-adicionados abrem o editor correspondente. No celular, seletores de anotação e relatório substituem listas longas.

Nos relatórios, título, autoria e relato ficam visíveis; identificação, classificação, assinatura e outras seções abrem conforme necessário. Acrescentar fontes da pasta abre a seção de destino. No quadro, exibição, histórico, zoom e exportação ficam em **Exibição e ferramentas**; a lista de ligações é recolhível. Etiquetas e rascunho de retorno também ficam recolhidos no andamento pessoal. São mudanças de apresentação: chaves de armazenamento, arquivos importados, vínculos, textos completos e formatos de exportação permanecem compatíveis.

## Perfil, missão atual e backup completo

O menu tem três grupos: **Consultar**, **Meu agente** e **Meu trabalho**. Seções do acervo sem registros ficam em **Outros arquivos**, conservando suas URLs. O painel inicial mostra atalhos para as coleções preenchidas. No celular, três atalhos fixos abrem missão, ficha de campo e anotações da missão atual; eles são recolhidos enquanto há uma janela aberta ou um campo em edição.

| Entrada | Uso |
| --- | --- |
| `#/meu-agente` | Perfil com os nomes de acesso, da ficha e da credencial |
| `#/minha-ficha?aba=campo` | Recursos atuais, testes, habilidades, ataques e rolagens |
| `#/minha-ficha` | Ficha completa, com os campos e a exportação do PDF original |
| `#/minha-missao` | Missão em acompanhamento: ordem, objetivos, anotações e relatórios |
| `#/salvar-meus-dados` | Backup completo dos dados pessoais |

O perfil permite escolher **Usar esse nome no acesso, na ficha e na credencial**. Ao salvar com a opção ativada, os três nomes são atualizados; alterações posteriores de nome na ficha ou credencial são sincronizadas ao sair do campo. A importação individual da ficha também respeita essa preferência. Desativar a opção conserva identidades independentes. A preferência fica em `gms-agent-profile-v1`, com `syncName`. A sincronização altera somente os nomes: atributos, habilidades, história, espécie e demais dados permanecem sob seus próprios controles. A escrita verifica alterações concorrentes e reverte gravações parciais em caso de falha.

**Continuar missão** reúne a ordem institucional, os objetivos pessoais, notas da pasta e relatórios do acervo e do agente. A seleção usa a mesma `missionId` do painel operacional. O acompanhamento de objetivos e etapas continua pessoal; não altera a situação oficial da missão. Novas anotações e relatórios criados nessa área já recebem o vínculo da missão. A barra de contexto e os atalhos da pasta acompanham a operação selecionada. Links diretos aceitam `#/minha-missao?missao=ID&aba=ordem|objetivos|anotacoes|relatorios`.

A **visão de campo** usa a mesma ficha e o mesmo motor de rolagens. Editar Vida ou Essência/Energia atualiza os campos originais; os máximos continuam calculados pelas fórmulas existentes. Atributos e perícias disparam os mesmos testes. Habilidades e ataques apresentam os dados preenchidos na ficha completa. O PDF fornecido, as opções e os cálculos do sistema não são reconstruídos nem substituídos.

O backup completo é um JSON com `format: arquivo-gms-dados-pessoais`, `version: 1`, limitado a **32 MB**. Inclui identidade, preferência de sincronização, ficha, credencial com retrato, missão selecionada, todas as coleções da pasta e sua lixeira, posições e ligações do quadro, relatórios pessoais, grifos e comentários, arquivos salvos, paleta e preferência de som. **Credenciais de consulta, sessões administrativas, edições do acervo e códigos secretos não integram essa cópia.** O exportador consulta também os rascunhos mantidos em memória pelos componentes quando o navegador recusou armazenamento.

A importação valida a cópia inteira antes de gravar. Notas e registros são mesclados; versões conflitantes viram cópias, com remapeamento de ligações. Por padrão, preserva identificação, ficha e credencial já preenchidas; **Restaurar os dados da cópia** também restaura esses dados e as preferências de aparência e som. A gravação é revertida se alguma parte falhar. **Desfazer última importação desta sessão** retorna aos dados anteriores, incluindo rascunhos que estavam em memória, desde que os registros não tenham mudado depois. Exportações e importações individuais anteriores continuam disponíveis em cada seção. Os dados permanecem locais ao navegador; transferir entre dispositivos é feito pelo arquivo de backup.

Implementação: `src/agent-profile-model.js` e `src/agent-profile.js` (identificação), `src/mission-workspace.js` (missão), `src/personal-backup-model.js` e `src/personal-backup.js` (backup), `src/personal-storage.js` (escrita com recuperação) e `src/workspace-experience.css` (navegação e apresentação). A visão de campo compartilha os componentes de `src/agent-sheet.js`.
