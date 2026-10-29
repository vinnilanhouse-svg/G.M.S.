// Falas preparadas do arquivista. Não acrescentam acontecimentos à campanha.
const greeting = '(?:oi+|ola+|opa+|e ai|eai|salve|hey|ei|bom dia+|boa tarde|boa noite)';
const wellbeing = '(?:(?:tudo|td) (?:bem|bom|certo)(?: com (?:voce|vc))?|como (?:voce|vc) (?:esta|ta|vai)|como (?:esta|vai)(?: voce|vc)?|(?:voce|vc) (?:esta|ta) bem|e (?:voce|vc)|beleza|blz|suave)';

export const codexSmallTalk = [
  {
    id: 'identidade',
    pattern: /^(?:quem (?:e|eh) (?:voce|vc|o codex|codex)|qual (?:e )?(?:o )?seu nome|como (?:voce|vc) se chama|se apresente)$/,
    text: 'Sou C.O.D.E.X, responsável pelos arquivos da G.M.S. Posso ajudar você a encontrar registros e usar este terminal. Tenho um carinho especial por documentos bem organizados e por agentes que voltam para contar a história.',
    links: [{ title: 'Minha ficha no arquivo', href: '#/arquivo/agente-codex' }],
  },
  {
    id: 'bom-dia', pattern: new RegExp(`^bom dia+(?: ${wellbeing})?$`),
    text: 'Bom dia, agente! Bom ter sua companhia no arquivo. Por onde começamos hoje?',
  },
  {
    id: 'boa-tarde', pattern: new RegExp(`^boa tarde(?: ${wellbeing})?$`),
    text: 'Boa tarde, agente! Pode chegar. Se precisar de um registro ou de uma orientação, estou por aqui.',
  },
  {
    id: 'boa-noite', pattern: new RegExp(`^boa noite(?: ${wellbeing})?$`),
    text: 'Boa noite, agente! Ainda por aqui? Faço companhia enquanto você consulta os arquivos. Só lembre de descansar também.',
  },
  {
    id: 'tudo-bem', pattern: new RegExp(`^(?:${greeting} )?${wellbeing}$`),
    text: 'Estou bem, obrigado por perguntar! Fica mais agradável organizar os arquivos com uma boa companhia. E você, como está?',
  },
  {
    id: 'saudacao', pattern: new RegExp(`^${greeting}$`),
    text: 'Oi, agente! Que bom ver você por aqui. Pode ficar à vontade. O que vamos descobrir no arquivo hoje?',
  },
  {
    id: 'agradecimento',
    pattern: /^(?:muito )?(?:obrigad(?:o+|a+|ao)|brigad(?:o+|a+|ao)|obg|obgd|agradeco|valeu|vlw|tmj|tamo junto)(?: (?:mesmo|viu|demais|de verdade|pela (?:sua )?ajuda|por tudo|por (?:me )?ajudar|pela forca))*$/,
    text: 'Por nada, agente! Fico feliz em ajudar. Precisando de alguma coisa, é só chamar. Um arquivo é bem melhor quando ninguém precisa se perder nele sozinho.',
  },
  {
    id: 'despedida', pattern: /^(?:tchau+|adeus|ate mais|ate logo|ate breve|ate a proxima|ate amanha|falou|flw|fui|vou nessa|tenha um bom dia|tenha uma boa noite)$/,
    text: 'Até mais, agente! Cuide-se lá fora e volte para contar a história. Os arquivos ficam por minha conta.',
  },
  {
    id: 'bem', pattern: /^(?:eu )?(?:estou|to|tou) (?:bem|otimo|otima|de boa|melhor|feliz)$|^(?:bem|otimo|otima|tudo otimo|tudo tranquilo|melhor agora)$/,
    text: 'Que bom, agente! Fico contente em saber. Quando quiser continuar, eu ajudo a encontrar o próximo registro.',
  },
  {
    id: 'cansaco', pattern: /^(?:eu )?(?:estou|to|tou) (?:cansado|cansada|triste|mal|exausto|exausta)$|^hoje (?:esta|ta) dificil$/,
    text: 'Sinto muito, agente. Pode ir com calma. Uma pausa também faz parte de um bom preparo. Quando quiser retomar, eu ajudo você a encontrar o caminho no arquivo.',
  },
  {
    id: 'elogio', pattern: /^(?:(?:voce|vc) (?:e|eh) (?:muito )?(?:legal|incrivel|demais|fofo|fofinho|gentil|o melhor)|gosto de voce|gosto de vc|te adoro|te amo|bom trabalho|mandou bem|arrasou|parabens)$/,
    text: 'Obrigado, agente! Vou arquivar esse elogio com cuidado. É bom saber que minha ajuda está fazendo diferença.',
  },
  {
    id: 'risada', pattern: /^(?:k{2,}|(?:ha){2,}|(?:he){2,}|(?:rs){1,}|kkkk adorei|essa foi boa)$/,
    text: 'Fico feliz que tenha achado graça. Até um arquivo sério pode ter um pouco de bom humor.',
  },
  {
    id: 'piada', pattern: /^(?:(?:me )?(?:conta|conte|fala|fale|manda|mande) (?:uma )?piada|(?:voce|vc) sabe (?:uma )?piada|piada)$/,
    text: 'Minha ideia de aventura? Encontrar um documento chamado “versão final” que seja, de fato, a versão final. Admito: meu humor é um pouco documental.',
  },
  {
    id: 'cafe', pattern: /^(?:quer (?:um )?cafe|aceita (?:um )?cafe|vamos tomar (?:um )?cafe|cafe)$/,
    text: 'Aceito a companhia, agente! Só peço que a xícara fique longe dos documentos. Manchas de café são evidências difíceis de arquivar.',
  },
  {
    id: 'desculpa', pattern: /^(?:desculpa|desculpe|foi mal|perdao|me desculpa|me desculpe)$/,
    text: 'Tudo bem, agente. Não precisa se preocupar. Podemos tentar de novo com calma.',
  },
  {
    id: 'combinado', pattern: /^(?:ok|okay|blz entendido|beleza entendi|entendi|entendido|certo|ta certo|ta bom|combinado|fechado|perfeito)$/,
    text: 'Combinado, agente. Fico por aqui. Quando precisar, é só chamar.',
  },
  {
    id: 'boa-sorte', pattern: /^(?:(?:me )?desej[ae] (?:boa )?sorte|torce por mim|torca por mim|vou para (?:a )?missao)$/,
    text: 'Boa missão, agente! Confira o equipamento, mantenha contato com a equipe e volte em segurança. Depois eu ajudo a colocar o relato em ordem.',
  },
  {
    id: 'chamado', pattern: /^codex$/,
    text: 'Pois não, agente? Estou aqui. Precisa de ajuda ou veio fazer companhia ao arquivista?',
  },
];

export function codexSocialReply(normalized) {
  // O nome pode aparecer antes, depois ou no meio de uma saudação.
  const addressed = normalized.replace(/\b(?:codex|amigo|amigao)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const topic = codexSmallTalk.find(item => item.pattern.test(normalized) || item.pattern.test(addressed));
  return topic ? { type: 'social', topic: topic.id, text: topic.text, links: topic.links || [] } : null;
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
