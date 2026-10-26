// Comentários narrativos do arquivista. Não acrescentam fatos aos acontecimentos.
const codexFace = '/agent-icons/codex-chibi-face.webp';
export const codexAnnotations = {
  'missao-sol-velado': {
    text: 'Bashir apresenta uma interpretação para os acontecimentos. A ordem registra o que precisa ser investigado. Preserve essa distinção: uma hipótese bem arquivada ainda é uma hipótese.',
    references: ['relatorio-bashir-sol-velado', 'missao-ultimo-sinal'],
  },
  'missao-ultimo-sinal': {
    text: 'Última localização conhecida não é localização atual. Antes de traçar uma rota, confronte a ordem anterior com o último relato disponível. O silêncio da equipe ainda deixa perguntas em aberto.',
    references: ['missao-sol-velado', 'relatorio-bashir-sol-velado'],
  },
  'relatorio-bashir-sol-velado': {
    text: 'O texto termina com a equipe a caminho da Ilha da Queimada Grande. Preserve essa sequência ao comparar os registros. Este documento não constitui um relatório de retorno.',
    references: ['missao-sol-velado', 'missao-ultimo-sinal'],
  },
  'relatorio-repouso-violado-inicial': {
    text: 'Um relatório inicial descreve o que era conhecido naquele momento. Leia-o junto do encerramento antes de tratar uma primeira impressão como conclusão.',
    references: ['relatorio-repouso-violado-encerramento'],
  },
  'missao-rastro-cortado': {
    text: 'Uma operação encerrada continua sendo uma fonte de consulta. Compare os registros de abertura e encerramento; as diferenças também fazem parte do trabalho de investigação.',
    references: ['relatorio-rastro-cortado-inicial', 'relatorio-rastro-cortado-encerramento'],
  },
  'especie-constructo': {
    text: 'Carne, Metal e Barro devem permanecer identificados nos registros individuais. Uma categoria em comum não torna suas particularidades intercambiáveis. A precisão começa no nome da composição.',
    references: [],
  },
  'org-gms': {
    text: 'A ausência de um código no índice de consulta não demonstra que o registro inexiste. Verifique os vínculos documentais antes de concluir que uma sequência está incompleta.',
    references: [],
  },
  'agente-codex': {
    text: 'Se precisar encontrar alguma coisa, comece pelo índice. Se o índice estiver errado, eu preciso saber primeiro.',
    references: ['org-gms'],
  },
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function codexAnnotation(record, availableRecords) {
  const note = codexAnnotations[record.id]; if (!note || record.unlisted) return '';
  const references = note.references.map(id => availableRecords.find(item => item.id === id && !item.unlisted)).filter(Boolean);
  return `<aside class="codex-margin-note" aria-label="Comentário de C.O.D.E.X"><div class="codex-note-heading"><span class="codex-note-symbol" style="--codex-face:url('${codexFace}')"><img src="${codexFace}" alt="Rosto chibi de C.O.D.E.X" width="48" height="48" loading="lazy" decoding="async"></span><span>C.O.D.E.X<small>NOTA DO ARQUIVISTA</small></span></div><p>${esc(note.text)}</p>${references.length ? `<div class="codex-note-references"><span>LEITURA CRUZADA</span>${references.map(item => `<a href="#/arquivo/${esc(item.id)}">${esc(item.code)} · ${esc(item.title)} ↗</a>`).join('')}</div>` : ''}</aside>`;
}
