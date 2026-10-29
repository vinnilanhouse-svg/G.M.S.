// Consulta local: respostas preparadas e trechos do índice, sem geração de lore.
const link = (title, href) => ({ title, href });
const sheet = link('Abrir minha ficha', '#/minha-ficha');
const folder = link('Abrir pasta de trabalho', '#/pasta-de-trabalho?aba=anotacoes');
const reports = link('Abrir meus relatórios', '#/pasta-de-trabalho?aba=relatorios');
const backup = link('Salvar meus dados', '#/salvar-meus-dados');

export const codexHelpTopics = [
  {
    id: 'backup', prompt: 'Como salvo todos os meus dados?',
    matches: q => /\b(?:backup|meus dados)\b/.test(q) || /(?:salvar|salvo|guardar|guardo|exportar|exporto|importar|importo|recuperar|recupero|transferir|transfiro|perdi).*(?:dados|tudo|trabalho)/.test(q) || /(?:outro|trocar de|mudar de) (?:celular|dispositivo|computador|navegador)/.test(q),
    text: 'Em Salvar meus dados, use Exportar backup completo para guardar sua ficha, credencial, pasta, quadro, relatórios e grifos em um arquivo JSON. Para recuperar a cópia, selecione o arquivo em Importar backup completo, confira a prévia e confirme. Esses registros ficam neste navegador; a cópia permite levá-los para outro dispositivo.',
    links: [backup],
  },
  {
    id: 'exportar-ficha', prompt: 'Como exporto minha ficha?',
    matches: q => /\b(?:exportar|exporto|baixar|baixo|salvar|salvo)\b/.test(q) && /\bficha\b/.test(q),
    text: 'Abra sua ficha e escolha Exportar PDF. O arquivo usa o modelo original, preenchido com os dados do seu agente. Exportar JSON guarda uma cópia dos campos. Na visualização Em campo, os mesmos controles ficam em Arquivos da ficha.',
    links: [sheet],
  },
  {
    id: 'importar-ficha', prompt: 'Como importo minha ficha?',
    matches: q => /\b(?:importar|importo|carregar|carrego)\b/.test(q) && /\bficha\b/.test(q),
    text: 'Na sua ficha, escolha Importar ficha e selecione o PDF editável do modelo original ou o JSON exportado pelo terminal. Confira os dados antes de confirmar. PDFs digitalizados, achatados ou de outro modelo não permitem recuperar os campos.',
    links: [sheet],
  },
  {
    id: 'relatorios', prompt: 'Como monto um relatório?',
    matches: q => /\brelatorios?\b/.test(q) && /\b(?:montar|monto|criar|crio|escrever|escrevo|exportar|exporto|importar|importo|meus)\b/.test(q),
    text: 'Na Pasta de trabalho, abra Relatórios e escolha Novo relatório. Você pode vincular uma missão, escrever o relato e incorporar registros da pasta. Exporte em PDF editável ou JSON; Importar relatório recupera esses formatos como uma nova cópia. O relatório pessoal não altera os documentos do acervo.',
    links: [reports],
  },
  {
    id: 'quadro', prompt: 'Como uso o quadro de evidências?',
    matches: q => /\b(?:quadro|evidencias|ligacao|ligacoes|cortica)\b/.test(q) && /\b(?:como|meu|minhas|criar|crio|exportar|exporto|usar|uso|ligar)\b/.test(q),
    text: 'Abra Quadro na Pasta de trabalho. Adicione evidências, arraste os cartões e use Criar ligação para relacionar duas pistas. Exibição e ferramentas reúne os controles do quadro e Exportar quadro, com imagem PNG e PDF em cortiça. A cópia JSON da pasta preserva os textos completos e as ligações.',
    links: [link('Abrir quadro de evidências', '#/pasta-de-trabalho?aba=evidencias')],
  },
  {
    id: 'notas', prompt: 'Onde faço minhas anotações?',
    matches: q => /\b(?:anotacoes|anotacao|notas|pasta de trabalho)\b/.test(q) && /\b(?:como|onde|minhas|minha|criar|crio|escrever|escrevo|buscar|busco)\b/.test(q),
    text: 'Use Anotações na Pasta de trabalho para registrar pistas e observações. O texto é salvo automaticamente neste navegador. Imagens e organização permite escolher ícones, etiquetas e missão. A busca da pasta encontra seus registros pessoais; a busca do arquivo consulta o acervo institucional.',
    links: [folder, backup],
  },
  {
    id: 'missao-pessoal', prompt: 'Como acompanho minha missão?',
    matches: q => /\bminha missao\b/.test(q) || /\b(?:acompanhar|acompanho|selecionar|seleciono|escolher|escolho)\b.*\bmissao\b/.test(q),
    text: 'Em Continuar missão, selecione a missão que está acompanhando. As abas reúnem a ordem, seus objetivos, anotações e relatórios. Marcar objetivos ou mudar sua etapa registra apenas o seu andamento pessoal; a situação oficial da missão permanece no acervo.',
    links: [link('Continuar minha missão', '#/minha-missao')],
  },
  {
    id: 'nome', prompt: 'Como mudo meu nome de acesso?',
    matches: q => /\bnome\b/.test(q) && /\b(?:mudar|mudo|trocar|troco|alterar|altero|editar|edito|acesso)\b/.test(q),
    text: 'Abra Perfil de agente para editar seu nome de acesso. Se quiser usar o mesmo nome também na ficha e na credencial, marque a opção de sincronização antes de salvar. Os demais dados desses registros são preservados.',
    links: [link('Abrir perfil de agente', '#/meu-agente')],
  },
  {
    id: 'dados', prompt: 'Como faço uma rolagem?',
    matches: q => /\b(?:rolar|rolagem|rolagens|d4|d6|d8|d10|d12|d20|d100)\b/.test(q) || /\bdados?\b/.test(q) && /\b(?:como|jogar|jogo|rolar|rolo)\b/.test(q),
    text: 'Na ficha, abra Central de rolagens para escolher um dado. Para um teste, clique no nome do atributo ou da perícia: o terminal usa o valor da ficha e apresenta o resultado com sua classificação. Em campo também oferece esses controles.',
    links: [link('Abrir central de rolagens', '#/minha-ficha?aba=rolagens')],
  },
  {
    id: 'grifos', prompt: 'Como grifo um documento?',
    matches: q => /\b(?:grifar|grifo|grifos|destacar|marcar texto)\b/.test(q),
    text: 'Abra um arquivo do acervo, selecione um trecho de um único parágrafo e escolha Grifar seleção. Depois, você pode escolher o tipo de marcação e escrever uma observação. Seus grifos são pessoais, ficam neste navegador e entram no backup completo.',
    links: [link('Consultar o acervo', '#/conhecimento'), backup],
  },
  {
    id: 'credencial', prompt: 'Como faço minha credencial?',
    matches: q => /\bminha credencial\b/.test(q) || /\b(?:criar|crio|fazer|faco|exportar|exporto)\b.*\bcredencial\b/.test(q),
    text: 'Abra Minha credencial pelo Perfil de agente. Preencha sua identificação, escolha um retrato e exporte em PNG ou PDF. Essa credencial é seu documento pessoal; os códigos recebidos para consultar arquivos são validados em Credenciais de acesso.',
    links: [link('Abrir minha credencial', '#/minha-credencial')],
  },
  {
    id: 'acesso', prompt: 'Onde uso uma credencial de acesso?',
    matches: q => /\b(?:codigo|credenciais|credencial de acesso|paleta|cores)\b/.test(q) && /\b(?:onde|como|usar|uso|validar|valido|trocar|troco|mudar|mudo)\b/.test(q),
    text: 'Abra Credenciais de acesso, digite o código que recebeu e escolha Validar. O campo também fica na parte inferior do menu. Só posso orientar a consulta; não forneço códigos de autorização.',
    links: [link('Abrir credenciais de acesso', '#/credenciais')],
  },
  {
    id: 'som', prompt: 'Como ativo o som?',
    matches: q => /\b(?:som|audio|volume)\b/.test(q),
    text: 'O controle Som fica na faixa de estado do terminal. Ative-o para ouvir os efeitos durante as rolagens. A preferência fica salva neste navegador.',
    links: [link('Abrir central de rolagens', '#/minha-ficha?aba=rolagens')],
  },
  {
    id: 'ficha', prompt: 'Onde está minha ficha?',
    matches: q => q === 'ficha' || /\bminha ficha\b/.test(q),
    text: 'Sua ficha completa fica no Perfil de agente. Para consultar vida, recursos, habilidades e testes durante uma operação, use Ficha em campo. As duas visualizações compartilham os mesmos dados.',
    links: [sheet, link('Abrir ficha em campo', '#/minha-ficha?aba=campo')],
  },
];

export const codexSuggestions = ['Como exporto minha ficha?', 'Relatório do Bashir', 'Espécies', 'Como salvo todos os meus dados?'];
export const codexGreeting = 'À disposição, agente. Posso localizar registros do índice e orientar o uso deste terminal. Informe um nome, código ou assunto.';
export const codexQueryLimit = 240;

export function normalizeCodexQuery(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\bc[.\s]*o[.\s]*d[.\s]*e[.\s]*x\b/g, 'codex')
    .replace(/\bg[.\s]*m[.\s]*s\b/g, 'gms')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

const ignored = new Set(('a as o os um uma uns umas de da das do dos e em no nos na nas ao aos para por com pelo pela que qual quais quem como onde quando quanto quantos esta estao e eh sao ser se me meu minha meus minhas eu voce voces vc ele ela eles elas deles delas dele dela sobre gostaria saber ver veja encontrar localizar buscar busca procure procurar preciso quero fale fala conte conta mostre mostra informacao informacoes historia situacao estado habilidades habilidade capacidades capacidade poderes poder apice iniciais adquiridas aconteceu acontecendo lidera liderou liderava participava participou tem todos todas todo toda favor porfa pfv pff porfavor').split(' '));
const kinds = new Map([
  ['especie', 'species'], ['especies', 'species'], ['criatura', 'species'], ['criaturas', 'species'],
  ['agente', 'agente'], ['agentes', 'agente'], ['missao', 'missao'], ['missoes', 'missao'],
  ['relatorio', 'relatorio'], ['relatorios', 'relatorio'], ['documento', 'documento'], ['documentos', 'documento'],
]);
const labels = { verbete: 'Entrada', agente: 'Agente', missao: 'Missão', relatorio: 'Relatório', documento: 'Documento', alvo: 'Alvo de interesse' };
const plural = { abissais: 'abissal', anoes: 'anao', lobisomens: 'lobisomem', lobisomen: 'lobisomem' };
const stem = word => plural[word] || (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word);
const words = text => new Set(normalizeCodexQuery(text).split(' ').map(stem));
const textOf = value => typeof value === 'string' ? value : '';
function passages(record) {
  return [record.summary, ...(record.report || []), ...(record.profile || []).map(row => `${row.label}: ${row.value}`),
    ...(record.abilities || []).flatMap(ability => [`${ability.title}: ${ability.text}`, ...(ability.details || []).map(part => `${part.title}: ${part.text}`)])].map(textOf).filter(Boolean);
}
function excerpt(value) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > 230 ? `${clean.slice(0, 227).replace(/\s+\S*$/, '')}…` : clean;
}

export function searchCodexRecords(query, records = []) {
  const normalized = normalizeCodexQuery(query);
  const tokens = normalized.split(' ');
  const scopes = new Set(tokens.map(token => kinds.get(token)).filter(Boolean));
  const terms = [...new Set(tokens.filter(token => !ignored.has(token) && !kinds.has(token) && token).map(stem))];
  // Somente o índice comum. Nem fichas não listadas nem anexos liberados por código.
  const available = records.filter(record => !record.unlisted && !record.requiredGrant && record.collection !== 'reservado' && /^[a-z0-9_-]+$/i.test(record.id));
  if (!terms.length && !scopes.size) return { total: 0, results: [] };
  const candidates = available.flatMap(record => {
    if (scopes.size && !scopes.has(record.kind) && !(scopes.has('species') && record.category === 'Espécies')) return [];
    const title = words(record.title); const code = words(record.code);
    const summary = words(record.summary);
    const meta = words([record.category, record.status, record.author, record.department].filter(Boolean).join(' '));
    const sections = passages(record);
    const body = words(sections.join(' '));
    if (!terms.every(term => title.has(term) || code.has(term) || meta.has(term) || body.has(term))) return [];
    let score = terms.reduce((sum, term) => sum + (title.has(term) ? 30 : 0) + (code.has(term) ? 40 : 0) + (meta.has(term) ? 8 : 0) + (summary.has(term) ? 5 : 0) + (body.has(term) ? 1 : 0), 0);
    if (terms.length && title.size === terms.length && terms.every(term => title.has(term))) score += 70;
    if (normalizeCodexQuery(record.title) === normalized || normalizeCodexQuery(record.code) === normalized) score += 100;
    const abilityQuery = /\b(?:habilidades?|capacidades?|poderes|apice)\b/.test(normalized);
    const ability = abilityQuery && record.abilities?.find(item => /\bapice\b/.test(normalized) ? item.stage === 'apex' : item.stage === 'initial');
    const passage = ability ? `${ability.title}: ${ability.text}` : sections.find(text => text.length > 60 && terms.length && terms.every(term => words(text).has(term))) || record.summary || '';
    return [{ score, id: record.id, title: record.title, code: record.code, kind: labels[record.kind] || 'Arquivo', status: record.status, access: record.access, excerpt: excerpt(passage), href: `#/arquivo/${record.id}` }];
  }).sort((a, b) => b.score - a.score || a.code.localeCompare(b.code, 'pt-BR', { numeric: true }));
  return { total: candidates.length, results: candidates.slice(0, 5).map(({ score, ...result }) => result) };
}

export function answerCodex(value, records = []) {
  const query = String(value ?? '').trim();
  if (!query) return { type: 'help', text: 'Informe um nome, código, assunto ou dúvida sobre o terminal.', links: [] };
  if (query.length > codexQueryLimit) return { type: 'help', text: `Use uma consulta de até ${codexQueryLimit} caracteres. Um nome, código ou pergunta curta é suficiente.`, links: [] };
  const normalized = normalizeCodexQuery(query);
  if (/^(?:oi|ola|bom dia|boa tarde|boa noite|ajuda|menu|o que voce faz|o que vc faz|quem e voce|quem e vc|obrigado|obrigada)$/.test(normalized)) {
    return { type: 'help', text: codexGreeting, links: [link('Consultar espécies', '#/conhecimento'), link('Consultar agentes', '#/agentes'), link('Consultar missões', '#/missoes')] };
  }
  const topic = codexHelpTopics.find(item => item.matches(normalized));
  if (topic) return { type: 'help', topic: topic.id, text: topic.text, links: topic.links };
  const { total, results } = searchCodexRecords(query, records);
  if (total) return { type: 'records', text: total === 1 ? 'Localizei um registro no índice. Confira o trecho e abra o arquivo para a leitura completa.' : `Localizei ${total} registros no índice.${total > 5 ? ' Exibindo os cinco mais próximos da consulta.' : ''} Abra os arquivos para conferir o contexto.`, total, results, links: [] };
  return { type: 'empty', text: 'Não localizei essa consulta no índice. Tente o nome de um agente, espécie, código de arquivo ou uma palavra do assunto. Também posso orientar você sobre ficha, anotações, relatórios e cópias dos seus dados.', links: [link('Base de conhecimento', '#/conhecimento'), link('Diretório de agentes', '#/agentes'), link('Missões', '#/missoes')] };
}
