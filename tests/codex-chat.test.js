import test from 'node:test';
import assert from 'node:assert/strict';
import { records } from '../src/data.js';
import { answerCodex, searchCodexRecords, codexHelpTopics, codexQueryLimit } from '../src/codex-chat-model.js';
import { codexSmallTalk, createCodexResponsePicker, personalizeCodexText } from '../src/codex-small-talk.js';

test('a assistência distingue operações da ficha, backup, relatório e rolagens', () => {
  const cases = [
    ['Como exporto minha ficha?', 'exportar-ficha', '#/minha-ficha'],
    ['Quero importar a ficha', 'importar-ficha', '#/minha-ficha'],
    ['Como salvo todos os meus dados?', 'backup', '#/salvar-meus-dados'],
    ['Como transfiro meus dados para outro celular?', 'backup', '#/salvar-meus-dados'],
    ['Como monto um relatório?', 'relatorios', '#/pasta-de-trabalho?aba=relatorios'],
    ['Como faço uma rolagem?', 'dados', '#/minha-ficha?aba=rolagens'],
    ['Como uso o quadro de evidências?', 'quadro', '#/pasta-de-trabalho?aba=evidencias'],
    ['Onde faço minhas anotações?', 'notas', '#/pasta-de-trabalho?aba=anotacoes'],
    ['Como mudo meu nome de acesso?', 'nome', '#/meu-agente'],
    ['Como grifo um documento?', 'grifos', '#/conhecimento'],
  ];
  for (const [query, topic, href] of cases) {
    const reply = answerCodex(query, records);
    assert.equal(reply.type, 'help', query); assert.equal(reply.topic, topic, query);
    assert.ok(reply.links.some(link => link.href === href), query);
  }
  for (const topic of codexHelpTopics) assert.equal(answerCodex(topic.prompt).topic, topic.id, topic.prompt);
  assert.equal(answerCodex('Onde está o relatório do Bashir?', records).type, 'records');
});

test('a busca combina termos, ignora acentos e pontuação e prioriza título e código', () => {
  const first = query => searchCodexRecords(query, records).results[0]?.id;
  assert.equal(first('Quem é Bashir?'), 'agente-bashir');
  assert.equal(first('  MIS — 561  '), 'missao-sol-velado');
  assert.equal(first('REL-561-001'), 'relatorio-bashir-sol-velado');
  assert.equal(first('C.O.D.E.X'), 'agente-codex');
  assert.equal(first('codex'), 'agente-codex');
  assert.equal(first('GMS'), 'org-gms');
  assert.equal(first('Quem é a G.M.S.?'), 'org-gms');
  assert.ok(searchCodexRecords('Qual missão Bashir liderava?', records).results.some(record => record.id === 'missao-sol-velado'));
  assert.equal(first('Espécie MÚMIA'), 'especie-mumia');
  assert.equal(first('espécie lobisomens'), 'especie-lobisomem');
  assert.equal(first('Qual a situação do Patrick?'), 'agente-patrick');
  assert.equal(first('Onde está o relatório do Bashir?'), 'relatorio-bashir-sol-velado');
  assert.equal(searchCodexRecords('Bashir palavrainexistente', records).total, 0);
  assert.equal(searchCodexRecords('rá', records).results.some(record => record.id === 'missao-sol-velado'), true);
});

test('consultas amplas limitam os resultados e não transformam agentes em novas espécies', () => {
  const source = structuredClone(records);
  const species = searchCodexRecords('Espécies', source);
  assert.equal(species.total, 20); assert.equal(species.results.length, 5);
  assert.ok(species.results.every(record => record.id.startsWith('especie-')));
  assert.equal(searchCodexRecords('espécie mantícora', source).total, 0);
  assert.equal(searchCodexRecords('agente Zaratha', source).results[0].id, 'agente-zaratha-khimer-atros');
  assert.deepEqual(source, records);
});

test('o índice recusa fichas ocultas e anexos por credencial mesmo recebendo o acervo completo', () => {
  const gated = { id: 'bloqueado', kind: 'documento', title: 'Canário confidencial', code: 'RES-712', summary: 'Vestígio exclusivo', report: ['Canário confidencial'], requiredGrant: 'chave' };
  const hidden = { ...gated, id: 'oculto', requiredGrant: undefined, unlisted: true };
  const reserved = { ...gated, id: 'reservado', requiredGrant: undefined, collection: 'reservado' };
  const unsafe = { ...gated, id: 'arquivo/<script>', requiredGrant: undefined };
  const source = [...records, gated, hidden, reserved, unsafe];
  for (const query of ['Morrow Noone', 'Wanderley', 'AGT-RES-090', 'Canário', 'Vestígio exclusivo', 'NATHALISM0', 'GAMREBELLO']) {
    const reply = answerCodex(query, source);
    assert.equal(reply.type, 'empty', query);
    assert.equal(reply.results, undefined);
    assert.ok(reply.links.every(link => !link.href.includes('/arquivo/')), query);
  }
  assert.ok(searchCodexRecords('Belias', source).results.some(record => record.id === 'agente-belias'));
});

test('as respostas citam dados atuais e preservam nomes de habilidades sem inventar conclusões', () => {
  const source = structuredClone(records);
  const patrick = source.find(record => record.id === 'agente-patrick');
  patrick.status = 'Situação revisada'; patrick.summary = 'Patrick: trecho revisado pelo responsável pelo arquivo, preservado na consulta ao índice.';
  const reply = answerCodex('Patrick', source);
  assert.equal(reply.results[0].status, 'Situação revisada');
  assert.equal(reply.results[0].excerpt, patrick.summary);
  const mummy = source.find(record => record.id === 'especie-mumia');
  const apex = mummy.abilities.find(ability => ability.stage === 'apex');
  assert.ok(answerCodex('Qual o ápice da espécie múmia?', source).results[0].excerpt.startsWith(`${apex.title}:`));
  const hypothetical = { id: 'hipotese', kind: 'documento', title: 'Marés', code: 'DOC-12', summary: 'Hipótese não confirmada: as marés poderiam explicar os sinais.', report: [] };
  assert.equal(answerCodex('marés', [hypothetical]).results[0].excerpt, hypothetical.summary);
});

test('perguntas desconhecidas e limites de consulta têm respostas explícitas, sem caminhos externos', () => {
  assert.equal(answerCodex('   ').type, 'help');
  assert.match(answerCodex('a'.repeat(codexQueryLimit + 1)).text, /até 240/);
  assert.equal(answerCodex('Crie uma espécie inédita chamada Xyz', records).type, 'empty');
  assert.equal(answerCodex('Olá', records).type, 'social');
  const replies = [answerCodex('<img src=x onerror=alert(1)>', records), ...codexHelpTopics.map(topic => answerCodex(topic.prompt, records))];
  for (const reply of replies) for (const link of reply.links) assert.match(link.href, /^#\/[a-z0-9/?=._-]+$/i);
});

test('C.O.D.E.X reconhece conversa casual, abreviações e seu nome sem confundir intenções', () => {
  const cases = [
    ['Oi!', 'saudacao'], ['Oiiii, C.O.D.E.X!!!', 'saudacao'], ['Olááá', 'saudacao'], ['E aí Codex?', 'saudacao'],
    ['Bom dia, Codex!', 'bom-dia'], ['Boa tarde', 'boa-tarde'], ['Boa noite!', 'boa-noite'],
    ['Oi Codex, tudo bem?', 'tudo-bem'], ['Como você está?', 'tudo-bem'], ['td bem?', 'tudo-bem'], ['Tudo bem com você?', 'tudo-bem'],
    ['Obrigado!', 'agradecimento'], ['Muito obrigada pela ajuda, Codex!', 'agradecimento'],
    ['obg', 'agradecimento'], ['Vlw', 'agradecimento'], ['Valeu demais mesmo!', 'agradecimento'], ['Brigadão!', 'agradecimento'], ['Obrigado pela sua ajuda!', 'agradecimento'],
    ['Até mais, Codex!', 'despedida'], ['Tchauuu!', 'despedida'], ['flw', 'despedida'],
    ['Estou bem', 'bem'], ['Tô cansada', 'cansaco'], ['Você é muito legal!', 'elogio'],
    ['Kkkkk', 'risada'], ['Me conta uma piada', 'piada'], ['Quer um café?', 'cafe'],
    ['Foi mal', 'desculpa'], ['Entendi', 'combinado'], ['Me deseja sorte', 'boa-sorte'],
    ['Quem é você?', 'identidade'], ['Quem é C.O.D.E.X?', 'identidade'], ['Codex', 'chamado'],
  ];
  for (const [query, topic] of cases) {
    const reply = answerCodex(query, records);
    assert.equal(reply.type, 'social', query); assert.equal(reply.topic, topic, query);
    assert.ok(reply.text.length > 20, query);
    assert.ok(reply.links.every(link => link.href === '#/arquivo/agente-codex'), query);
  }
  assert.equal(new Set(['Oi', 'Obrigado', 'Até mais'].map(query => answerCodex(query).text)).size, 3);
});

test('cumprimentos e agradecimentos não interceptam perguntas sobre o terminal ou os arquivos', () => {
  assert.equal(answerCodex('Oi, Codex! Como exporto minha ficha?', records).topic, 'exportar-ficha');
  assert.equal(answerCodex('Bom dia, como salvo meus dados?', records).topic, 'backup');
  for (const query of ['Oi, quem é Bashir?', 'Codex, onde está o relatório do Bashir, por favor?', 'Obrigado! Onde está o relatório do Bashir?']) {
    const reply = answerCodex(query, records);
    assert.equal(reply.type, 'records', query);
    assert.ok(reply.results.some(result => result.id.includes('bashir')), query);
  }
  assert.equal(answerCodex('Obrigado, onde está Morrow Noone?', records).type, 'empty');
  assert.equal(answerCodex('O relatório desconhecido cita a palavra obrigado', []).type, 'empty');
  assert.equal(answerCodex('Oi, invente a história de uma criatura nova', records).type, 'empty');
  assert.equal(answerCodex('Fale sobre C.O.D.E.X', records).results[0].id, 'agente-codex');
  assert.equal(answerCodex('Codex agente', records).results[0].id, 'agente-codex');
});

test('as falas usam a identificação de acesso como texto e preservam o conteúdo dos registros', () => {
  const options = { agentName: '  Ana\nLua  ' };
  for (const query of ['Oi', 'Obrigado', 'Até mais', 'Qual é meu nome?', 'ajuda']) {
    const reply = answerCodex(query, records, options);
    assert.ok(reply.text.includes('Ana Lua'), query); assert.doesNotMatch(reply.text, /\{agente\}/);
  }
  const name = '<b>Ana</b> $& {agente}';
  assert.equal(personalizeCodexText('Olá, {agente}!', name), `Olá, ${name}!`);
  assert.equal(personalizeCodexText('Olá, {agente}!', ''), 'Olá, agente!');
  assert.match(answerCodex('Qual é meu nome?').text, /conferir ou atualizar sua identificação/);
  assert.equal(answerCodex('Como mudo meu nome de acesso?', records, options).topic, 'nome');
  assert.equal(answerCodex('Bashir', records, options).results[0].excerpt, answerCodex('Bashir', records).results[0].excerpt);
});

test('cada assunto sorteia todas as suas falas antes de repetir, inclusive entre rodadas', () => {
  const pick = createCodexResponsePicker(count => count - 1);
  const jokes = codexSmallTalk.find(topic => topic.id === 'piada').responses;
  assert.ok(jokes.length >= 10);
  assert.ok(codexSmallTalk.find(topic => topic.id === 'saudacao').responses.length >= 5);
  assert.ok(codexSmallTalk.reduce((sum, topic) => sum + topic.responses.length, 0) >= 68);
  for (const topic of codexSmallTalk) {
    assert.equal(new Set(topic.responses).size, topic.responses.length, topic.id);
    const first = Array.from({ length: topic.responses.length }, () => pick(topic.id, topic.responses.length));
    const next = Array.from({ length: topic.responses.length }, () => pick(topic.id, topic.responses.length));
    assert.equal(new Set(first).size, topic.responses.length, topic.id);
    assert.equal(new Set(next).size, topic.responses.length, topic.id);
    assert.notEqual(first.at(-1), next[0], topic.id);
  }
  const independent = createCodexResponsePicker(() => 0);
  assert.equal(independent('piada', 10), 0); assert.equal(independent('saudacao', 6), 0);
  assert.equal(independent('piada', 10), 1);
});

test('a variação acontece só nas falas sociais, preserva vínculos e personaliza cada sorteio', () => {
  let draws = 0;
  const pickResponse = createCodexResponsePicker(() => { draws++; return 0; });
  const options = { agentName: 'Aurora', pickResponse };
  const replies = Array.from({ length: 10 }, () => answerCodex('Outra piada, Codex!', records, options));
  assert.equal(new Set(replies.map(reply => reply.text)).size, 10);
  assert.ok(replies.every(reply => reply.topic === 'piada' && reply.text.includes('Aurora')));
  assert.equal(draws, 10);
  answerCodex('Como exporto minha ficha?', records, options);
  answerCodex('Onde está o relatório do Bashir?', records, options);
  answerCodex('Morrow Noone', records, options);
  assert.equal(draws, 10);
  assert.equal(answerCodex('Quem é você?', records, options).links[0].href, '#/arquivo/agente-codex');
});
