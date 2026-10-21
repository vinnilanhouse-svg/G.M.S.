// Credenciais narrativas de demonstração. Códigos e conteúdo estão no frontend;
// este mecanismo não substitui autenticação ou autorização em um servidor.
export const accessStorageKey = 'gms-access-v1';

export const credentials = [
  {
    id: 'arquivo-reservado', code: 'GMS-ARQUIVO',
    label: 'Arquivo reservado',
    description: 'Consulta à seção reservada e aos seus anexos documentais.',
    route: '#/reservado', page: 'reservado',
  },
  {
    id: 'inteligencia', code: 'GMS-INTEL',
    label: 'Dossiê de inteligência',
    description: 'Consulta a um dossiê complementar em Alvos de interesse.',
    route: '#/arquivo/alvo-reservado-demo',
  },
];

export function normalizeAccessCode(value) {
  return typeof value === 'string' ? value.normalize('NFKC').trim().toUpperCase() : '';
}

export function findCredential(code) {
  const normalized = normalizeAccessCode(code);
  return credentials.find(credential => credential.code === normalized);
}

export function readActiveCredentials(raw) {
  try {
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter(id => credentials.some(c => c.id === id)) : []);
  } catch {
    return new Set();
  }
}

export function hasRecordAccess(record, activeCredentials) {
  return !record.requiredGrant || activeCredentials.has(record.requiredGrant);
}

export function visibleRecords(records, activeCredentials) {
  return records.filter(record => hasRecordAccess(record, activeCredentials));
}

const demo = {
  demo: true, source: false, date: '2026-10-21',
  author: 'Secretaria de Registro · modelo não canônico',
  department: 'Arquivo de demonstração', status: 'Registrado',
};

export const reservedRecords = [
  {
    ...demo,
    id: 'doc-reservado-demo-001', kind: 'documento', code: 'RES-DEMO-001',
    title: 'Anexo de circulação reservada', category: 'Anexos reservados', access: 'Restrito',
    requiredGrant: 'arquivo-reservado', collection: 'reservado',
    summary: 'Documento ilustrativo disponibilizado mediante credencial de acesso.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este anexo demonstra a liberação de conteúdo adicional por credencial. Não descreve um acontecimento da história oficial.',
      'A autorização deste terminal permite consultar os documentos desta coleção. Informações sobre operações, pessoas e locais aguardam incorporação ao registro.',
    ],
    related: ['doc-reservado-demo-002', 'org-gms'],
  },
  {
    ...demo,
    id: 'doc-reservado-demo-002', kind: 'documento', code: 'RES-DEMO-002',
    title: 'Registro reservado de encaminhamento', category: 'Registros de circulação', access: 'Censurado',
    requiredGrant: 'arquivo-reservado', collection: 'reservado',
    summary: 'Modelo de documento reservado com identificação parcialmente suprimida.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este registro apresenta um segundo documento da coleção reservada.',
      'Destinatário: ████████████. Referência de encaminhamento: ████████. Nenhuma identidade oficial foi atribuída a este modelo.',
    ],
    related: ['doc-reservado-demo-001'],
  },
  {
    ...demo,
    id: 'alvo-reservado-demo', kind: 'alvo', code: 'ALV-RES-DEMO',
    title: 'Grupo não identificado — dossiê complementar', category: 'Grupo', access: 'Restrito', status: 'Sob apuração',
    requiredGrant: 'inteligencia',
    summary: 'Dossiê ilustrativo de circulação adicional, acessível por credencial específica.',
    report: [
      'EXEMPLO NÃO CANÔNICO. Este perfil demonstra a liberação individual de um registro na seção Alvos de interesse. Não representa uma organização da história oficial.',
      'A identidade do grupo, seus vínculos e suas motivações permanecem não informados. A presença neste diretório não constitui atribuição de culpa.',
    ],
    profile: [
      { label: 'Identificação', value: 'Não confirmada' },
      { label: 'Avaliação de risco', value: 'Não determinada' },
    ],
    facts: ['Este dossiê é um exemplo de acesso adicional.'],
    hypotheses: [], unknown: ['Identidade, vínculos e motivações.'],
    related: ['alvo-demo-001', 'org-gms'],
  },
];
