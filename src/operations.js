// Cadastros operacionais editáveis. Os exemplos abaixo não fazem parte da lore oficial.
// Use IDs estáveis para vincular agentes, missões, relatórios, alvos e investigações.
const demo = {
  demo: true,
  source: false,
  date: '2026-10-21',
  department: 'Arquivo de demonstração',
  author: 'Secretaria de Registro · modelo não canônico',
  access: 'Restrito',
};

export const operationalRecords = [
  {
    ...demo,
    id: 'agente-demo-001', kind: 'agente', code: 'AGT-DEMO-001',
    title: 'Agente de referência — modelo', category: 'Equipe de campo', status: 'Cadastro pendente',
    summary: 'Ficha de demonstração para reunir identificação, lotação e histórico de missões de um agente.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este cadastro demonstra a organização do diretório de agentes. Não representa uma pessoa da história oficial.',
      'A identificação, a espécie, a lotação e o histórico funcional aguardam preenchimento. As missões e os relatórios relacionados podem ser consultados nos vínculos deste registro.',
    ],
    profile: [
      { label: 'Identificação', value: 'Não informada' },
      { label: 'Espécie', value: 'Não informada' },
      { label: 'Lotação', value: 'A definir' },
      { label: 'Função', value: 'Agente de campo · modelo' },
    ],
    related: ['missao-demo-001', 'relatorio-demo-001', 'org-gms'],
  },
  {
    ...demo,
    id: 'missao-demo-001', kind: 'missao', code: 'MIS-DEMO-001',
    title: 'Verificação costeira — modelo', category: 'Reconhecimento', status: 'Em planejamento',
    summary: 'Ordem ilustrativa para demonstrar o vínculo entre uma missão, a equipe designada e seus relatórios.',
    report: [
      'EXEMPLO NÃO CANÔNICO. A missão não corresponde a uma operação da história oficial. Seu objetivo é apresentar a estrutura de consulta operacional.',
      'Objetivo: reunir referências sobre convivência em uma comunidade costeira e organizar o reconhecimento antes de qualquer intervenção. Local, equipe efetiva e autorização aguardam definição.',
      'Os relatórios vinculados registram separadamente a preparação e as observações da missão. O estado da missão não confirma nem encerra automaticamente a investigação relacionada.',
    ],
    agentIds: ['agente-demo-001'], targetIds: ['alvo-demo-001'],
    profile: [
      { label: 'Objetivo', value: 'Reconhecimento e reunião de referências' },
      { label: 'Local', value: 'Não estabelecido na lore' },
      { label: 'Autorização', value: 'Pendente · modelo' },
    ],
    timeline: [
      { date: 'PREPARAÇÃO', text: 'Consulta às referências de convivência e ao verbete dos Abissais.' },
      { date: 'REGISTRO', text: 'Reunião dos relatórios ilustrativos vinculados à missão.' },
    ],
    related: ['agente-demo-001', 'caso-001', 'especie-abissais', 'alvo-demo-001'],
  },
  {
    ...demo,
    id: 'relatorio-demo-001', kind: 'relatorio', code: 'REL-DEMO-001',
    title: 'Preparação do reconhecimento costeiro', category: 'Relatório preliminar', status: 'Preliminar',
    missionId: 'missao-demo-001', agentIds: ['agente-demo-001'],
    summary: 'Modelo de relatório vinculado à missão MIS-DEMO-001, com referências preparatórias.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este documento demonstra como um relatório é arquivado dentro de uma missão.',
      'Foram reunidas referências sobre os Abissais e sobre o mandato de convivência da GMS. Nenhuma diligência ou observação de campo real é afirmada neste modelo.',
      'Permanecem pendentes a identificação da equipe efetiva, a definição do local e a autorização da operação.',
    ],
    related: ['missao-demo-001', 'agente-demo-001', 'especie-abissais', 'doc-convivencia'],
  },
  {
    ...demo,
    id: 'relatorio-demo-002', kind: 'relatorio', code: 'REL-DEMO-002',
    title: 'Registro complementar de referências', category: 'Relatório complementar', status: 'Em revisão',
    missionId: 'missao-demo-001', agentIds: ['agente-demo-001'],
    summary: 'Complemento ilustrativo que mantém observações e lacunas separadas do planejamento da missão.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este é um segundo documento de demonstração associado à mesma missão.',
      'Não foram incorporados depoimentos, evidências ou identificações oficiais. Uma inclusão em alvos de interesse indica a necessidade de apuração; não constitui atribuição de culpa.',
    ],
    related: ['missao-demo-001', 'alvo-demo-001', 'relatorio-demo-001'],
  },
  {
    ...demo,
    id: 'alvo-demo-001', kind: 'alvo', code: 'ALV-DEMO-001',
    title: 'Indivíduo não identificado — modelo', category: 'Indivíduo', status: 'Sob apuração',
    summary: 'Dossiê ilustrativo de interesse investigativo. A inclusão no diretório não constitui confirmação de culpa.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este perfil serve como modelo para registrar indivíduos, grupos ou organizações sob investigação. Não representa um antagonista oficial.',
      'Identidade, vínculos e motivações permanecem não informados. Nenhuma conduta criminosa pode ser atribuída com base neste cadastro.',
      'O histórico de um alvo deve distinguir fatos documentados, linhas de apuração e informações desconhecidas, mantendo ligações para as investigações e missões pertinentes.',
    ],
    profile: [
      { label: 'Identificação', value: 'Não confirmada' },
      { label: 'Vínculo', value: 'Não confirmado' },
      { label: 'Avaliação de risco', value: 'Não determinada' },
    ],
    facts: ['Este perfil é apenas um modelo de cadastro.'],
    hypotheses: [],
    unknown: ['Identidade, motivações, filiações e envolvimento em ocorrências.'],
    related: ['missao-demo-001', 'relatorio-demo-002', 'caso-001'],
  },
];
