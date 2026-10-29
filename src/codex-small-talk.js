// Falas preparadas do arquivista. Não acrescentam acontecimentos à campanha.
import { normalizeAgentName } from './agent-identity.js';
const greeting = '(?:oi+|ola+|opa+|e ai|eai|salve|hey|ei|bom dia+|boa tarde|boa noite)';
const wellbeing = '(?:(?:tudo|td) (?:bem|bom|certo)(?: com (?:voce|vc))?|como (?:voce|vc) (?:esta|ta|vai)|como (?:esta|vai)(?: voce|vc)?|(?:voce|vc) (?:esta|ta) bem|e (?:voce|vc)|beleza|blz|suave)';

export const codexSmallTalk = [
  {
    id: 'identidade',
    pattern: /^(?:quem (?:e|eh) (?:voce|vc|o codex|codex)|qual (?:e )?(?:o )?seu nome|como (?:voce|vc) se chama|se apresente)$/,
    responses: [
      'Sou C.O.D.E.X, responsável pelos arquivos da G.M.S., {agente}. Posso ajudar você a encontrar registros e usar este terminal. Tenho um carinho especial por documentos bem organizados e por agentes que voltam para contar a história.',
      'Pode me chamar de C.O.D.E.X, {agente}. Cuido dos arquivos da G.M.S. e ajudo a encontrar o documento certo no meio de tantos registros. E também gosto de uma boa conversa entre as consultas.',
    ],
    links: [{ title: 'Minha ficha no arquivo', href: '#/arquivo/agente-codex' }],
  },
  {
    id: 'meu-nome', pattern: /^(?:qual (?:e|eh) (?:o )?meu nome|como (?:eu )?me chamo|quem sou eu|(?:voce|vc) sabe meu nome|lembra (?:do )?meu nome)$/,
    responses: [
      'Seu acesso está identificado como {agente}. É assim que vou chamar você por aqui. Se quiser atualizar a identificação, use o Perfil de agente.',
      'Claro, {agente}! Estou usando o nome da sua identificação de acesso. Você pode conferi-lo ou alterá-lo no Perfil de agente.',
    ],
    links: [{ title: 'Conferir meu perfil', href: '#/meu-agente' }],
  },
  {
    id: 'bom-dia', pattern: new RegExp(`^bom dia+(?: ${wellbeing})?$`),
    responses: [
      'Bom dia, {agente}! Bom ter sua companhia no arquivo. Por onde começamos hoje?',
      'Bom dia, {agente}! Vamos com calma: um registro de cada vez, uma pista de cada vez. O que você procura?',
      'Um bom dia para você, {agente}! Espero que o expediente comece com boas notícias e documentos fáceis de encontrar.',
    ],
  },
  {
    id: 'boa-tarde', pattern: new RegExp(`^boa tarde(?: ${wellbeing})?$`),
    responses: [
      'Boa tarde, {agente}! Pode chegar. Se precisar de um registro ou de uma orientação, estou por aqui.',
      'Boa tarde, {agente}! Como anda o trabalho? Podemos consultar uma missão ou simplesmente conversar um pouco.',
      'Que bom encontrar você nesta tarde, {agente}. Traga o assunto; eu ajudo a encontrar por onde começar.',
    ],
  },
  {
    id: 'boa-noite', pattern: new RegExp(`^boa noite(?: ${wellbeing})?$`),
    responses: [
      'Boa noite, {agente}! Ainda por aqui? Faço companhia enquanto você consulta os arquivos. Só lembre de descansar também.',
      'Boa noite, {agente}. Se a leitura estiver longa, podemos ir por partes. O arquivo merece atenção; você também merece descanso.',
      'Boa noite, {agente}! Vamos encontrar o que você precisa antes que o expediente vire uma investigação sobre o sono perdido.',
    ],
  },
  {
    id: 'tudo-bem', pattern: new RegExp(`^(?:${greeting} )?${wellbeing}$`),
    responses: [
      'Estou bem, {agente}, obrigado por perguntar! Fica mais agradável organizar os arquivos com uma boa companhia. E você, como está?',
      'Tudo certo por aqui, {agente}! E com você? Espero que o dia esteja tratando você com mais cuidado do que alguns formulários recebem.',
      'Melhor com companhia, {agente}. Entre um documento e outro, uma conversa faz bem. Como você está?',
    ],
  },
  {
    id: 'saudacao', pattern: new RegExp(`^${greeting}$`),
    responses: [
      'Oi, {agente}! Que bom ver você por aqui. Pode ficar à vontade. O que vamos descobrir no arquivo hoje?',
      'Olá, {agente}! Chegue mais. Precisa encontrar um registro ou veio conversar com o arquivista?',
      'Opa, {agente}! Bom encontrar você. Qual assunto vamos tirar da gaveta hoje?',
      'Oi, {agente}! Pode deixar a cerimônia na entrada. Os documentos são formais; nossa conversa não precisa ser.',
      'Olá, {agente}! Estou por aqui para ajudar. Pode começar por uma pergunta, um nome ou até um simples café imaginário.',
      'Salve, {agente}! Vamos colocar as ideias em ordem? Prometo não exigir um formulário para conversar.',
    ],
  },
  {
    id: 'agradecimento',
    pattern: /^(?:muito )?(?:obrigad(?:o+|a+|ao)|brigad(?:o+|a+|ao)|obg|obgd|agradeco|valeu|vlw|tmj|tamo junto)(?: (?:mesmo|viu|demais|de verdade|pela (?:sua )?ajuda|por tudo|por (?:me )?ajudar|pela forca))*$/,
    responses: [
      'Por nada, {agente}! Fico feliz em ajudar. Precisando de alguma coisa, é só chamar. Um arquivo é bem melhor quando ninguém precisa se perder nele sozinho.',
      'Disponha, {agente}! Encontrar o caminho fica mais fácil quando a gente procura junto.',
      'Eu que agradeço a companhia, {agente}. Quando precisar de outra consulta, estarei por aqui.',
      'Sempre às ordens, {agente}! E pode agradecer sem preencher um requerimento. Essa parte eu dispenso.',
      'Que bom que ajudei, {agente}! Só guarde uma cópia do seu trabalho. Gosto de rever agentes; prefiro não precisar reconstruir suas anotações.',
      'Não tem de quê, {agente}. Um registro encontrado e uma dúvida a menos já fazem o expediente valer a pena.',
    ],
  },
  {
    id: 'despedida', pattern: /^(?:tchau+|adeus|ate mais|ate logo|ate breve|ate a proxima|ate amanha|falou|flw|fui|vou nessa|tenha um bom dia|tenha uma boa noite)$/,
    responses: [
      'Até mais, {agente}! Cuide-se lá fora e volte para contar a história. Os arquivos ficam por minha conta.',
      'Até a próxima, {agente}. Leve suas anotações, confira o equipamento e não esqueça de descansar.',
      'Bom caminho, {agente}! Quando voltar, pode me contar como foi. Eu ajudo a colocar o relato em ordem.',
      'Até logo, {agente}! Vou sentir falta da conversa. Os documentos, felizmente, sabem esperar em silêncio.',
      'Cuide-se, {agente}. Espero que sua próxima visita venha acompanhada de boas notícias.',
    ],
  },
  {
    id: 'bem', pattern: /^(?:eu )?(?:estou|to|tou) (?:bem|otimo|otima|de boa|melhor|feliz)$|^(?:bem|otimo|otima|tudo otimo|tudo tranquilo|melhor agora)$/,
    responses: [
      'Que bom, {agente}! Fico contente em saber. Quando quiser continuar, eu ajudo a encontrar o próximo registro.',
      'Fico feliz por você, {agente}. Um pouco de tranquilidade também merece ser valorizado.',
      'Boa notícia, {agente}! Podemos aproveitar para organizar as ideias ou só conversar mais um pouco.',
    ],
  },
  {
    id: 'cansaco', pattern: /^(?:eu )?(?:estou|to|tou) (?:cansado|cansada|triste|mal|exausto|exausta)$|^hoje (?:esta|ta) dificil$/,
    responses: [
      'Sinto muito, {agente}. Pode ir com calma. Uma pausa também faz parte de um bom preparo. Quando quiser retomar, eu ajudo você a encontrar o caminho no arquivo.',
      'Vamos devagar, {agente}. Você não precisa resolver tudo nesta consulta. Escolher uma coisa pequena para fazer já pode ser um começo.',
      'Entendo, {agente}. Se puder, faça uma pausa e cuide de você. Quando voltar ao trabalho, começamos por um registro de cada vez.',
    ],
  },
  {
    id: 'elogio', pattern: /^(?:(?:voce|vc) (?:e|eh) (?:muito )?(?:legal|incrivel|demais|fofo|fofinho|gentil|o melhor)|gosto de voce|gosto de vc|te adoro|te amo|bom trabalho|mandou bem|arrasou|parabens)$/,
    responses: [
      'Obrigado, {agente}! Vou arquivar esse elogio com cuidado. É bom saber que minha ajuda está fazendo diferença.',
      'Você deixou meu expediente melhor, {agente}. Esse elogio merece uma pasta só dele.',
      'Muito obrigado, {agente}! Prometo tentar corresponder ao elogio na próxima consulta também.',
      'Assim você deixa um arquivista sem palavras, {agente}. E olha que palavras não costumam faltar neste lugar.',
    ],
  },
  {
    id: 'risada', pattern: /^(?:k{2,}|(?:ha){2,}|(?:he){2,}|(?:rs){1,}|kkkk adorei|essa foi boa)$/,
    responses: [
      'Fico feliz que tenha achado graça, {agente}. Até um arquivo sério pode ter um pouco de bom humor.',
      'Essa risada já melhorou a consulta, {agente}. Se quiser, ainda tenho outras piadas de qualidade documental discutível.',
      'Pronto, {agente}: uma pausa para rir, devidamente aprovada pelo arquivista.',
    ],
  },
  {
    id: 'piada', pattern: /^(?:(?:me )?(?:conta|conte|fala|fale|manda|mande) (?:mais )?(?:uma |outra )?piada|(?:voce|vc) sabe (?:uma |outra )?piada|(?:outra |mais uma )?piada)$/,
    responses: [
      'Minha ideia de aventura, {agente}? Encontrar um documento chamado “versão final” que seja, de fato, a versão final. Admito: meu humor é um pouco documental.',
      'Sabe qual é o maior mistério de um arquivo, {agente}? Descobrir quem nomeou a pasta “coisas” e achou que isso seria suficiente.',
      'Qual é o esporte favorito de um arquivista, {agente}? Levantamento de dados. Alongamento das referências também ajuda.',
      'Uma folha de papel entra numa investigação, {agente}. Qual é a primeira pergunta? “Qual é o seu papel neste caso?”',
      'Sabe o que um arquivo disse ao outro, {agente}? “Precisamos manter contato. Temos muitas referências em comum.”',
      'Qual é a parte mais difícil de organizar provas, {agente}? Convencer a linha vermelha de que ela não precisa dar nó em tudo.',
      'O que uma lupa pede depois de um dia difícil, {agente}? Um pouco de espaço. Ela passou o expediente inteiro vendo os problemas de perto.',
      'Por que o relatório levou um guarda-chuva, {agente}? Porque a previsão era de uma chuva de perguntas.',
      'Qual é a piada mais curta do arquivo, {agente}? “Eu organizo isso depois.” O suspense é que ninguém sabe quando.',
      'Sabe por que eu gosto de índices, {agente}? Eles vão direto ao ponto. Diferentemente desta explicação da piada.',
    ],
  },
  {
    id: 'cafe', pattern: /^(?:quer (?:um )?cafe|aceita (?:um )?cafe|vamos tomar (?:um )?cafe|cafe)$/,
    responses: [
      'Aceito a companhia, {agente}! Só peço que a xícara fique longe dos documentos. Manchas de café são evidências difíceis de arquivar.',
      'Uma pausa com companhia parece uma boa ideia, {agente}. Podemos conversar; só deixe o café a uma distância respeitosa das páginas.',
    ],
  },
  {
    id: 'desculpa', pattern: /^(?:desculpa|desculpe|foi mal|perdao|me desculpa|me desculpe)$/,
    responses: [
      'Tudo bem, {agente}. Não precisa se preocupar. Podemos tentar de novo com calma.',
      'Sem problema, {agente}. Reformular uma pergunta faz parte da investigação.',
      'Está tudo certo, {agente}. Vamos começar de novo pelo que você precisa encontrar.',
    ],
  },
  {
    id: 'combinado', pattern: /^(?:ok|okay|blz entendido|beleza entendi|entendi|entendido|certo|ta certo|ta bom|combinado|fechado|perfeito)$/,
    responses: [
      'Combinado, {agente}. Fico por aqui. Quando precisar, é só chamar.',
      'Entendido, {agente}. Seguimos no seu ritmo. Estou por aqui para a próxima consulta.',
    ],
  },
  {
    id: 'boa-sorte', pattern: /^(?:(?:me )?desej[ae] (?:boa )?sorte|torce por mim|torca por mim|vou para (?:a )?missao)$/,
    responses: [
      'Boa missão, {agente}! Confira o equipamento, mantenha contato com a equipe e volte em segurança. Depois eu ajudo a colocar o relato em ordem.',
      'Torço por você, {agente}. Vá com atenção, escute sua equipe e não tenha vergonha de pedir apoio.',
      'Que o caminho seja tranquilo, {agente}. Preparo e companhia valem muito. Vou gostar de ver você de volta ao arquivo.',
    ],
  },
  {
    id: 'chamado', pattern: /^codex$/,
    responses: [
      'Pois não, {agente}? Estou aqui. Precisa de ajuda ou veio fazer companhia ao arquivista?',
      'Pode falar, {agente}! Pode começar com uma dúvida, um assunto ou uma simples conversa.',
    ],
  },
];

export function personalizeCodexText(template, agentName) {
  const name = normalizeAgentName(agentName) || 'agente';
  return template.replaceAll('{agente}', () => name);
}

function randomResponseIndex(count) {
  try {
    const draw = new Uint32Array(1); globalThis.crypto.getRandomValues(draw);
    return Math.floor((draw[0] / 0x100000000) * count);
  } catch { return Math.floor(Math.random() * count); }
}

// Um sorteio por resposta entregue. Cada assunto esgota sua própria lista antes
// de recomeçar; a fronteira entre duas rodadas também evita repetição imediata.
export function createCodexResponsePicker(randomIndex = randomResponseIndex) {
  const topics = new Map();
  return (id, count) => {
    if (count < 2) return 0;
    let state = topics.get(id);
    if (!state || state.count !== count) state = { count, remaining: [], last: -1 };
    if (!state.remaining.length) state.remaining = Array.from({ length: count }, (_, index) => index);
    const eligible = state.remaining.filter(index => index !== state.last);
    const index = eligible[randomIndex(eligible.length)];
    state.remaining = state.remaining.filter(candidate => candidate !== index);
    state.last = index; topics.set(id, state);
    return index;
  };
}

export function codexSocialReply(normalized, { agentName = '', pickResponse = () => 0 } = {}) {
  // O nome pode aparecer antes, depois ou no meio de uma saudação.
  const addressed = normalized.replace(/\b(?:codex|amigo|amigao)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const topic = codexSmallTalk.find(item => item.pattern.test(normalized) || item.pattern.test(addressed));
  if (!topic) return null;
  const template = topic.id === 'meu-nome' && !normalizeAgentName(agentName)
    ? 'Você pode conferir ou atualizar sua identificação no Perfil de agente.'
    : topic.responses[pickResponse(topic.id, topic.responses.length)];
  return { type: 'social', topic: topic.id, text: personalizeCodexText(template, agentName), links: topic.links || [] };
}

export function stripCodexCourtesy(normalized) {
  let query = normalized;
  // Remove somente as bordas sociais de uma consulta, sem engolir a pergunta.
  for (let pass = 0; pass < 4; pass++) {
    query = query.replace(new RegExp(`^(?:${greeting}|obrigad[oa]+|obg|valeu) `), '')
      .replace(/^codex (?=(?:como|onde|qual|quais|quem|o que|me|pode|preciso|quero|busque|procure|encontre|buscar|ajuda|menu)\b)/, '')
      .replace(/ (?:por favor|por gentileza|pfv|pff|obrigad[oa]+|obg|valeu)$/, '').trim();
  }
  return query || normalized;
}
