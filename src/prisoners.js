import { speciesIcons, constructIcons } from './species-icons.js';
// Personagens e retratos criados e aprovados para o arquivo de custódia.
const common = { kind: 'prisioneiro', category: 'Prisioneiros', access: 'Restrito', demo: false, source: false, date: '2026-10-30', department: 'Arquivo de Custódia', author: 'Secretaria de Registro · G.M.S.', sourceNote: 'Ficha de custódia · G.M.S.' };
const portrait = (id, name) => ({src:`/agents/${id}.webp`,alt:`Retrato de ${name}`,width:1024,height:1536,caption:'Arquivo de Custódia · G.M.S.'});
export const prisonerRecords = [
  {
    ...common, id:'prisioneiro-silas-vilar', code:'PRI-286', title:'Silas Vilar — “O Fiador”', status:'Sob custódia',
    icon:speciesIcons['especie-leprechaun'], image:portrait('prisioneiro-silas-vilar','Silas Vilar'),
    summary:'Leprechaun. Responsável por uma rede de empréstimos, extorsão e coerção dirigida a criaturas sem acesso a instituições comuns.',
    report:[
      'Silas comandava uma rede de empréstimos destinada a criaturas que precisavam de dinheiro e não podiam procurar instituições comuns. Oferecia documentos, moradia e proteção, cobrando depois por meio de ameaças, extorsão e serviços criminosos. Mantinha os devedores convencidos de que sua sorte sobrenatural tornava qualquer tentativa de fuga inútil.',
      'A G.M.S. chegou até ele após investigar desaparecimentos ligados a um mesmo escritório de cobranças. Silas foi encontrado tentando comprar a lealdade dos próprios agentes enviados para prendê-lo.',
      'Continua cordial durante os interrogatórios. Sabe o nome dos funcionários, oferece conselhos financeiros e insiste em chamar sua detenção de “um problema contratual”.'
    ],
    note:'Observação de custódia: propostas de troca, presentes e favores devem ser registrados. Silas procura transformar pequenas concessões em obrigações pessoais.',
    profile:[{label:'Identificação',value:'Silas Vilar'},{label:'Também conhecido como',value:'O Fiador'},{label:'Espécie',value:'Leprechaun'},{label:'Condição',value:'Sob custódia'}],
    related:['especie-leprechaun','org-gms']
  },
  {
    ...common,id:'prisioneira-helena-moura',code:'PRI-419',title:'Helena Moura — “A Viúva do Vidro”',status:'Aguardando conclusão da investigação',
    icon:speciesIcons['especie-gorgona'],image:portrait('prisioneira-helena-moura','Helena Moura'),
    summary:'Górgona. Investigada por sequestros e pelo transporte clandestino de vítimas petrificadas sob a fachada de uma empresa de mudanças.',
    report:[
      'Helena administrava uma empresa de transporte especializada em mudanças discretas para clientes sobrenaturais. Utilizava essa estrutura para sequestrar criaturas e transportar vítimas petrificadas como peças de decoração. Os destinos eram escolhidos por intermediários que ela afirma nunca ter conhecido pessoalmente.',
      'Sua captura ocorreu durante a interceptação de um carregamento. Entre esculturas legítimas, os agentes localizaram pessoas desaparecidas e pertences que permitiram identificá-las.',
      'Helena reconhece sua participação nos transportes, mas contesta a autoria dos sequestros. Tem fornecido endereços e nomes em troca de condições melhores de custódia; parte das informações foi confirmada, enquanto outras levaram a imóveis abandonados.'
    ],
    note:'Observação de custódia: procedimentos de segurança visual devem preservar sua integridade e a dos funcionários. A condição das vítimas permanece sob acompanhamento especializado.',
    profile:[{label:'Identificação',value:'Helena Moura'},{label:'Também conhecida como',value:'A Viúva do Vidro'},{label:'Espécie',value:'Górgona'},{label:'Condição',value:'Aguardando conclusão da investigação'}],
    related:['especie-gorgona','org-gms']
  },
  {
    ...common,id:'prisioneiro-otavio-ferraz',code:'PRI-753',title:'Otávio Ferraz — “Contrapeso”',status:'Custódia preventiva',
    icon:constructIcons.metal,image:portrait('prisioneiro-otavio-ferraz','Otávio Ferraz'),
    summary:'Constructo de Metal. Investigado por sabotagens em abrigos de comunidades sobrenaturais, seguidas de cobranças para impedir novos incidentes.',
    report:[
      'Otávio trabalhava na manutenção de instalações utilizadas por comunidades sobrenaturais. Seu acesso a plantas, sistemas elétricos e rotas de emergência permitiu organizar sabotagens em abrigos. Depois das primeiras falhas, oferecia reparos e exigia pagamentos cada vez maiores para impedir novos incidentes.',
      'A investigação ganhou prioridade quando uma pane deliberada deixou moradores presos durante um incêndio. A G.M.S. relacionou componentes adulterados encontrados no local a outras ocorrências atendidas por Otávio.',
      'Ele descreve seus crimes com o vocabulário de uma ordem de serviço. Ao ser questionado sobre as vítimas, costuma responder com estimativas de danos materiais. Demonstra preocupação especial com a conservação do próprio corpo e solicita ferramentas que poderiam comprometer a segurança da cela.'
    ],
    note:'Observação de custódia: reparos devem ser executados por equipe autorizada. Nenhuma ferramenta deve permanecer com o detido após o atendimento.',
    profile:[{label:'Identificação',value:'Otávio Ferraz'},{label:'Também conhecido como',value:'Contrapeso'},{label:'Espécie',value:'Constructo de Metal'},{label:'Condição',value:'Custódia preventiva'}],
    related:['especie-constructo','org-gms']
  }
];
