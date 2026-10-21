// Fichas acessadas por credencial, fora do diretório e das buscas do acervo.
// Preencha apenas informações fornecidas pelo autor da campanha.
export const privateAgentRecords = [
  {
    id: 'agente-morrow-noone',
    kind: 'agente',
    code: 'AGT-RES-001',
    title: 'Morrow Noone',
    category: 'Registro reservado',
    access: 'Restrito',
    status: 'Cadastro incompleto',
    requiredGrant: 'morrow-noone',
    unlisted: true,
    demo: false,
    source: false,
    sourceNote: 'Ficha reservada · dados complementares pendentes.',
    date: '2026-10-21',
    department: 'Arquivo de Pessoal',
    author: 'Secretaria de Registro · G.M.S.',
    summary: 'Ficha de agente disponibilizada mediante credencial específica.',
    report: [
      'Identificação registrada: Morrow Noone.',
      'O histórico e os demais dados funcionais deste agente ainda não foram incorporados a esta ficha.',
    ],
    profile: [
      { label: 'Identificação', value: 'Morrow Noone' },
      { label: 'Espécie', value: 'Não informada' },
      { label: 'Cargo', value: 'Não informado' },
    ],
    related: ['org-gms'],
  },
];
