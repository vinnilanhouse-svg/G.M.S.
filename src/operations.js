// Conteúdo aprovado para a campanha. A data indica a incorporação ao arquivo,
// sem estabelecer datas para os acontecimentos da história.
// As seções mantêm o texto completo em `report`, usado pela busca integrada.
function mission({ sections, ...record }) {
  const report = [];
  const reportSections = sections.map(({ title, paragraphs, list = false }) => {
    const start = report.length;
    report.push(...paragraphs);
    return { title, start, list };
  });
  return {
    kind: 'missao',
    demo: false,
    source: false,
    sourceNote: 'Ordem de missão · G.M.S.',
    date: '2026-10-22',
    department: 'Comando de Operações',
    author: 'Comando de Operações · G.M.S.',
    access: 'Restrito',
    ...record,
    report,
    reportSections,
  };
}

export const operationalRecords = [
  mission({
    id: 'missao-sol-velado',
    code: 'MIS-561',
    title: 'Operação Sol Velado',
    category: 'Investigação e reconhecimento',
    status: 'Contato perdido',
    summary: 'Investigação solicitada por Bashir sobre a perda de capacidades e de vida entre múmias, com possível relação com o Sol e com Rá. A Equipe Vigília perdeu contato durante a operação.',
    profile: [
      { label: 'Natureza', value: 'Investigação e reconhecimento' },
      { label: 'Equipe', value: 'Vigília' },
      { label: 'Responsável pela operação', value: 'Agente Bashir' },
      { label: 'Origem da solicitação', value: 'Alterações na condição de múmias e possível relação com o Sol' },
      { label: 'Área de operação', value: 'Ilha da Queimada Grande — Ilha das Cobras' },
      { label: 'Coordenadas de referência da ilha', value: '24°29′10″S, 46°40′30″W' },
    ],
    agentIds: ['agente-bashir'],
    related: ['missao-ultimo-sinal', 'relatorio-bashir-sol-velado', 'agente-bashir', 'especie-mumia'],
    sections: [
      {
        title: 'Origem da solicitação',
        paragraphs: [
          'O agente Bashir apresentou à G.M.S. um pedido de investigação após identificar ocorrências incomuns entre indivíduos da espécie Múmia.',
          'Segundo seu relato, algumas múmias começaram a perder capacidades que, até então, faziam parte de sua existência. Em outros casos, a própria condição que as mantinha vivas parecia estar se desfazendo. Houve indivíduos que deixaram de responder, perderam os sinais de consciência e, por fim, cessaram completamente suas atividades.',
          'Bashir também informou que outras múmias estavam sentindo que havia algo errado, embora não conseguissem explicar com precisão a natureza dessa percepção. A recorrência desses relatos o levou a considerar que as ocorrências poderiam ter uma origem comum.',
          'Em sua solicitação, o agente foi direto: acreditava que algo estava acontecendo com Rá, o deus egípcio do Sol.',
        ],
      },
      {
        title: 'Avaliação inicial da G.M.S.',
        paragraphs: [
          'A interpretação apresentada por Bashir não recebeu respaldo inicial. A referência a Rá foi tratada pelos responsáveis pela avaliação como uma explicação religiosa ligada a uma figura lendária.',
          'Os relatos sobre as múmias, entretanto, justificaram a abertura de uma investigação. A perda de capacidades próprias da espécie e os casos de interrupção da vida constituíam ocorrências graves, independentemente da explicação proposta pelo solicitante.',
          'A possível relação com o Sol também foi incluída na apuração. Ainda não havia informações suficientes para determinar se essa associação correspondia a uma influência observável ou à maneira como os indivíduos afetados compreendiam o que estavam sentindo.',
          'A operação foi autorizada sob a liderança de Bashir, considerando seu conhecimento da espécie, sua familiaridade com as tradições envolvidas e seu contato com os primeiros relatos.',
        ],
      },
      {
        title: 'Objetivos da operação',
        list: true,
        paragraphs: [
          'Investigar os casos registrados. Reunir informações sobre as múmias afetadas, as primeiras alterações percebidas e a evolução de cada ocorrência.',
          'Identificar possíveis padrões. Verificar se os casos compartilham circunstâncias, períodos, locais ou outros fatores relevantes.',
          'Apurar a possível relação com o Sol. Registrar evidências que permitam avaliar essa hipótese.',
          'Examinar os relatos das múmias. Documentar suas percepções com fidelidade, distinguindo experiências relatadas de interpretações sobre suas causas.',
          'Realizar o reconhecimento na Ilha das Cobras. Registrar os elementos encontrados durante essa etapa da investigação e avaliar sua relação com as ocorrências.',
          'Prestar auxílio aos indivíduos afetados. Solicitar apoio caso sejam encontradas múmias em processo de enfraquecimento ou perda de consciência.',
        ],
      },
      {
        title: 'Orientações de campo',
        paragraphs: [
          'A equipe deverá preservar os registros obtidos e comunicar imediatamente qualquer nova ocorrência de perda de capacidades ou interrupção da vida.',
          'Objetos pessoais, inscrições e materiais funerários deverão ser examinados com cuidado. Sua importância para os envolvidos e sua possível relação com os acontecimentos precisam ser registradas antes de qualquer remoção.',
          'Bashir deverá manter a central informada sobre mudanças em sua própria condição. Qualquer alteração semelhante às descritas na solicitação exigirá uma reavaliação das condições de continuidade da operação.',
        ],
      },
      {
        title: 'Determinação do comando',
        paragraphs: [
          'A G.M.S. autoriza a Equipe Vigília a investigar a origem das ocorrências e avaliar a possibilidade de novos casos.',
          'A causa permanece desconhecida. A extensão do fenômeno também.',
          'Descubram o que está acontecendo com as múmias antes que outros indivíduos sejam afetados.',
        ],
      },
    ],
  }),
  mission({
    id: 'missao-ultimo-sinal',
    code: 'MIS-568',
    title: 'Operação Último Sinal',
    category: 'Busca e reconhecimento',
    status: 'Em andamento',
    summary: 'Busca pela Equipe Vigília, liderada por Bashir e desaparecida durante a Operação Sol Velado. A última localização confirmada da equipe foi na Ilha da Queimada Grande.',
    profile: [
      { label: 'Natureza', value: 'Busca e reconhecimento' },
      { label: 'Equipe desaparecida', value: 'Vigília' },
      { label: 'Líder da equipe desaparecida', value: 'Agente Bashir' },
      { label: 'Situação da equipe desaparecida', value: 'Contato perdido · Paradeiro desconhecido' },
      { label: 'Última localização confirmada', value: 'Ilha da Queimada Grande — Ilha das Cobras' },
      { label: 'Coordenadas de referência da ilha', value: '24°29′10″S, 46°40′30″W' },
    ],
    related: ['missao-sol-velado', 'relatorio-bashir-sol-velado', 'agente-bashir'],
    sections: [
      {
        title: 'Resumo da ocorrência',
        paragraphs: [
          'A Equipe Vigília, sob a liderança do agente Bashir, foi enviada à Ilha das Cobras para investigar os acontecimentos relacionados a uma missão anterior da G.M.S.',
          'A última localização confirmada da equipe foi na ilha. Desde então, a organização não conseguiu restabelecer contato com seus integrantes, e nenhum retorno ou pedido de extração foi registrado.',
          'As informações disponíveis ainda são insuficientes para determinar o que aconteceu. Não há confirmação de confronto, captura ou morte. A ausência de comunicação deve ser tratada como uma ocorrência de causa desconhecida.',
          'Uma nova equipe está sendo mobilizada para reconhecer o local, localizar os desaparecidos e esclarecer as circunstâncias da interrupção do contato.',
        ],
      },
      {
        title: 'Objetivos da operação',
        list: true,
        paragraphs: [
          'Localizar a Equipe Vigília. Identificar o paradeiro de Bashir e dos demais integrantes, verificar suas condições e providenciar o resgate.',
          'Realizar o reconhecimento da ilha. Procurar vestígios da passagem dos agentes e reconstruir seu percurso.',
          'Recuperar registros da investigação. Recolher anotações, equipamentos de comunicação e outros materiais que ajudem a reconstruir os últimos movimentos da equipe.',
          'Determinar a causa do desaparecimento. Avaliar os vestígios encontrados e registrar possíveis relações com a missão que estava sendo investigada.',
          'Estabelecer condições de retirada. Identificar pontos de extração e rotas para a evacuação dos agentes encontrados.',
        ],
      },
      {
        title: 'Orientações de campo',
        paragraphs: [
          'A prioridade desta operação é a recuperação dos integrantes da Equipe Vigília. A continuidade da investigação anterior dependerá das condições encontradas e de uma nova avaliação do comando.',
          'Durante o reconhecimento, os agentes deverão registrar as condições dos locais examinados antes de movimentar objetos. Documentos, pertences pessoais e equipamentos abandonados podem permitir a reconstrução dos acontecimentos e devem ser preservados sempre que as circunstâncias permitirem.',
          'Qualquer sinal de sobreviventes exige atenção imediata. Vestígios que indiquem o deslocamento da equipe devem ser acompanhados de uma avaliação do terreno e das condições de comunicação antes de prosseguir.',
          'Bashir é um agente experiente, conhecido pela paciência e pelo cuidado com seus companheiros. Seus hábitos e métodos de trabalho podem ajudar a interpretar os registros encontrados. Essas referências deverão ser consideradas junto às evidências recolhidas no local.',
        ],
      },
      {
        title: 'Determinação do comando',
        paragraphs: [
          'Até que existam evidências conclusivas, todos os integrantes da Equipe Vigília permanecem registrados como desaparecidos.',
          'A equipe designada deverá manter a central informada sobre sua posição, comunicar cada descoberta relevante e solicitar apoio assim que identificar uma necessidade de resgate.',
          'Localizem nossos agentes. Descubram o que aconteceu. Tragam-nos de volta.',
        ],
      },
    ],
  }),
  {
    id: 'relatorio-bashir-sol-velado',
    kind: 'relatorio',
    code: 'REL-561-001',
    title: 'Sol Velado — relatório de Bashir',
    category: 'Relatório de andamento',
    access: 'Restrito',
    status: 'Em andamento',
    date: '2026-10-22',
    department: 'Operações de Campo',
    author: 'Agente Bashir',
    demo: false,
    source: false,
    sourceNote: 'Relatório de andamento · Operação Sol Velado.',
    summary: 'Registro em primeira pessoa sobre a origem da investigação, a preocupação de Bashir com Rá e as evidências que levaram a Equipe Vigília à Ilha da Queimada Grande. Encerrado durante a travessia.',
    missionId: 'missao-sol-velado',
    agentIds: ['agente-bashir'],
    profile: [
      { label: 'Tipo de registro', value: 'Relatório de andamento' },
      { label: 'Equipe', value: 'Vigília' },
      { label: 'Momento do registro', value: 'Durante a travessia para a Ilha da Queimada Grande' },
    ],
    related: ['missao-sol-velado', 'missao-ultimo-sinal', 'agente-bashir', 'especie-mumia'],
    report: [
      'Solicitei esta investigação depois de visitar uma múmia que havia perdido o controle de suas próprias faixas.',
      'Ela continuava consciente. Reconheceu minha voz, respondeu às minhas perguntas e tentou demonstrar o que estava acontecendo. Observei suas mãos durante algum tempo. Os movimentos que antes lhe exigiam tão pouco esforço agora pareciam depender de uma força que ela já não conseguia alcançar.',
      'Retornei no dia seguinte. Sua condição havia piorado.',
      'Outros relatos chegaram até mim nas semanas seguintes. Alguns indivíduos descreviam um enfraquecimento gradual. Outros haviam perdido capacidades que os acompanhavam desde o despertar. Em mais de um caso, recebi a notícia de que alguém simplesmente havia deixado de viver.',
      'Estive diante de um desses corpos. Permaneci ao seu lado procurando algum sinal de consciência. Fiz as orações que conhecia. Aguardei. Ao sair, precisei explicar àqueles que esperavam por mim que eu não havia conseguido ajudá-lo.',
      'Foi nesse período que comecei a ouvir a mesma observação em lugares diferentes: havia algo errado com o Sol.',
      'As palavras variavam. Uma mulher descreveu a sensação de ter sido abandonada sob a luz do dia. Outro indivíduo afirmou que sentia falta de alguma coisa sempre que o Sol nascia. Nenhum deles sabia explicar o que estava perdendo.',
      'Eu também vinha sentindo aquilo.',
      'Conheço a tranquilidade que certos ritos me trazem e reconheço a presença que sempre associei às minhas orações. Essa presença estava se tornando distante. Em alguns momentos, interrompia uma prece com a impressão de que algo havia acontecido enquanto eu falava.',
      'Foi por isso que escrevi o nome de Rá na solicitação encaminhada à G.M.S.',
      'Durante a avaliação, discutimos as condições das múmias, possíveis agentes externos e a necessidade de reunir registros. Também ouvi que minha preocupação com Rá se referia a uma figura lendária e oferecia pouca contribuição à investigação.',
      'Solicitei que minha declaração permanecesse no documento.',
      'Acredito que há algo errado com Rá. Considero essa possibilidade central para compreender o que está acontecendo conosco.',
      'A operação foi autorizada em razão das ocorrências envolvendo as múmias. Assumi a liderança da Equipe Vigília e iniciamos o levantamento dos casos, entrevistando os indivíduos afetados e procurando acontecimentos que coincidissem com as primeiras alterações.',
      'Durante essa etapa, reunimos relatos de pescadores que haviam observado uma claridade incomum na direção da Ilha da Queimada Grande. Descreviam uma luz baixa, próxima ao horizonte, que permanecia visível depois do pôr do sol. Os primeiros avistamentos coincidiam aproximadamente com o período em que as múmias começaram a adoecer.',
      'Entrevistamos duas dessas testemunhas separadamente e pedimos que indicassem em um mapa o local de onde acreditavam que a luz vinha. Ambas apontaram para a ilha.',
      'Uma delas contou que teve dificuldade para perceber se o Sol já havia terminado de se pôr. Lembrava-se da hora, conhecia aquele trecho do mar e ainda assim permaneceu olhando, esperando que a claridade desaparecesse.',
      'Encaminhei os depoimentos à central e comuniquei que daríamos continuidade à investigação na Ilha da Queimada Grande.',
      'Ainda precisamos verificar a origem dessa luz e sua possível relação com as múmias. Quanto a Rá, mantenho o que declarei no início da operação. A cada novo relato, cresce minha preocupação com aquilo que podemos encontrar.',
      'Revisamos nossos equipamentos e os procedimentos de comunicação. Antes do embarque, segurei o ankh junto ao peito e fiz minhas orações. Os demais integrantes da equipe já me aguardavam.',
      'Deixamos o cais há poucos minutos. Encerro este registro durante a travessia.',
      'A Equipe Vigília está a caminho da Ilha da Queimada Grande.',
      '— Agente Bashir',
    ],
  },
];
