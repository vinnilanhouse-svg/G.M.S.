import { speciesIcons } from './species-icons.js';
import { agentRecords } from './agents.js';
import { speciesAbilities } from './species-abilities.js';
import { speciesImages } from './species-images.js';
import { reservedRecords } from './permissions.js';
import { operationalRecords } from './operations.js';
// Lore adaptada do manual fornecido. Capacidades são narrativas; não há regras de jogo.
export const sourceInfo = {"title": "Manual de referência · edição 1.7", "url": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"};
export const categories = ["Espécies", "Pessoas", "Organizações", "Fenômenos"];
export const records = [
  {
    "id": "especie-abissais",
    "image": speciesImages["especie-abissais"],
    "icon": speciesIcons["especie-abissais"],
    "kind": "verbete",
    "code": "ESP-001",
    "title": "Abissais",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Habitantes anfíbios dos oceanos, organizados em pequenos clãs e ligados às criaturas das profundezas.",
    "report": [
      "A origem dos Abissais é envolta em mistério e lendas. Muitos acreditam que eles surgiram nas profundezas dos oceanos, como uma ramificação dos primeiros seres a evoluir. Enquanto alguns escolheram seguir o caminho da terra firme, os Abissais permaneceram fiéis às águas, tornando-se guardiões das marés e senhores dos recifes. São considerados descendentes de um ancestral que rejeitou a evolução terrestre, optando por abraçar a vida aquática em sua plenitude",
      "Sua aparência é tão fascinante quanto assustadora. São humanoides de estatura variada, semelhantes aos humanos, mas com características que os ligam irrevogavelmente ao mundo subaquático. Suas peles são cobertas por escamas iridescentes, que brilham como pérolas sob a luz do sol ou das profundezas. Suas bocas largas são adornadas com dentes afiados, prontos para rasgar presas ou defender seu território. As mãos e pés são uma mistura de membros humanos e nadadeiras, permitindo que nadem com a graça de um golfinho ou caminhem com a destreza de um predador. Nas costas, uma barbatana dorsal imponente se estende da base da coluna até o topo da cabeça, ondulando como uma bandeira nas correntes marinhas. Guelras laterais em seus pescoços permitem que respirem tanto nas profundezas quanto na superfície, tornando-os verdadeiros anfíbios.",
      "Os Abissais vivem em pequenos clãs subaquáticos, raramente se aventurando além das ondas. Quando o fazem, é por necessidade extrema: para caçar, para fugir de ameaças ou, em raros casos, para explorar o mundo dos \"terrestres\". Sua relação com outras espécies é marcada por uma desconfiança natural, e eles são conhecidos por sua hostilidade cautelosa. Nas grandes cidades, são uma visão rara, mas em comunidades costeiras, sua presença é mais comum, ainda que sempre envolta em mistério e respeito.",
      "Alguns Abissais carregam características únicas, influenciadas pelas criaturas marinhas de suas regiões. Esses indivíduos podem mimetizar aspectos de tubarões, polvos ou até mesmo criaturas mitológicas, como sereias ou tritões. Essas adaptações não apenas os tornam mais eficientes em seu ambiente natural, mas também os transformam em lendas vivas, seres que desafiam a linha entre a realidade e o mito.",
      "Os Abissais são mais do que meros habitantes das profundezas; eles são a personificação do oceano, uma lembrança viva de que, enquanto os homens conquistaram a terra, as águas ainda guardam segredos que nunca serão totalmente revelados."
    ],
    "quote": "Se os mares são o berço da vida, por que abandoná-los para viver na terra dos homens?",
    "abilities": speciesAbilities["especie-abissais"],
    "notableMembers": [],
    "facts": [
      "Respiram na água e na superfície.",
      "A hidratação é essencial à sua condição física."
    ],
    "hypotheses": [
      "Descenderiam de uma linhagem que permaneceu no ambiente aquático."
    ],
    "unknown": [
      "A origem exata da espécie e a natureza dos seres antigos."
    ],
    "related": [
      "especie-salamandra",
      "org-gms"
    ],
    "source": true,
    "sourceSection": "2.1. Abissais;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-anjo",
    "image": speciesImages["especie-anjo"],
    "icon": speciesIcons["especie-anjo"],
    "kind": "verbete",
    "code": "ESP-002",
    "title": "Anjos",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Mensageiros alados de aparência humana, ligados a um propósito superior e a uma forma verdadeira de luz.",
    "report": [
      "Desde os primórdios da criação, os Anjos têm sido mensageiros e guardiões, enviados pelo Criador para cumprir missões que transcendem a compreensão mortal. Embora sua presença tenha sido registrada ao longo da história, muitos homens os ignoraram, cegos pela descrença ou pela incapacidade de enxergar além do véu do mundo físico.",
      "Os Anjos são seres de luz e propósito, cuja aparência terrena é uma mera sombra de sua verdadeira glória. Em sua forma manifesta, assemelham-se a humanos, mas são envoltos por uma aura de pureza e majestade que os distingue dos mortais. Grandes asas de penas brilhantes, que variam do branco imaculado ao dourado celestial, adornam suas costas, e uma auréola de luz paira sobre suas cabeças, símbolo de sua conexão divina. No entanto, esses atributos podem ser ocultados, permitindo que se movam entre os homens sem chamar atenção, embora sua presença ainda irradie uma sensação de paz e autoridade.",
      "Cada Anjo carrega consigo uma missão única, designada pelo próprio Criador. Seja para proteger, guiar, punir ou inspirar, suas ações são sempre alinhadas com um propósito maior, mesmo que esse propósito permaneça obscuro para aqueles que os observam. Eles são, por natureza, pacíficos e benevolentes para com todas as criaturas, exceto os Demônios, seus eternos adversários. A rivalidade entre Anjos e Demônios é tão antiga quanto o próprio tempo, uma batalha cósmica entre luz e escuridão, ordem e caos. Enquanto os Demônios são presos às regras e decretos de seu criador, os Anjos agem como instrumentos da vontade divina, imunes às corrupções do mundo material.",
      "Apesar de sua natureza celestial, muitos questionam a verdadeira essência dos Anjos. Alguns acreditam que eles não são seres divinos, mas sim criaturas místicas que se assemelham às representações angelicais encontradas em diversas religiões e mitologias. Essa dúvida, no entanto, não diminui seu impacto no mundo. Figuras lendárias como o Anjo Gabriel, mensageiro das revelações; o Anjo Miguel, o guerreiro celestial que lidera as hostes do céu; e o Cupido, o portador do amor e da paixão, são exemplos notáveis dessa espécie, cujas ações ecoam através dos séculos.",
      "Os Anjos são mais do que meros servos do divino; eles são a personificação da esperança, da justiça e da luz que ilumina até os cantos mais sombrios da existência. Quando descem à Terra, não trazem apenas mensagens, mas também a promessa de que, mesmo nas horas mais escuras, o céu nunca está tão distante."
    ],
    "quote": "E ao soar das trombetas, os Anjos de Deus descerão dos céus à Terra, trazendo consigo a luz divina.",
    "abilities": speciesAbilities["especie-anjo"],
    "notableMembers": [],
    "facts": [
      "Possuem asas que podem ser ocultadas.",
      "Seu toque pode restaurar ferimentos."
    ],
    "hypotheses": [
      "Sua condição pode ser mística, em vez de divina, como sugerem interpretações registradas."
    ],
    "unknown": [
      "A essência definitiva de sua origem e os propósitos de cada missão."
    ],
    "related": [
      "especie-demonio"
    ],
    "source": true,
    "sourceSection": "2.2. Anjo;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-caipora",
    "image": speciesImages["especie-caipora"],
    "icon": speciesIcons["especie-caipora"],
    "kind": "verbete",
    "code": "ESP-003",
    "title": "Caiporas",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Espíritos guardiões de pele e cabelos vermelhos, protetores da fauna e da flora das florestas.",
    "report": [
      "Os Caiporas são espíritos antigos, tão antigos quanto as próprias florestas que habitam. Eles são a encarnação da defesa da fauna e da flora, os guardiões silenciosos que vigiam cada folha, cada animal e cada riacho. São os seguranças da mata, os protetores intransigentes de um equilíbrio que poucos compreendem e muitos ameaçam.",
      "Originalmente encontrados apenas nos vastos territórios brasileiros, os Caiporas são seres que carregam a essência da natureza em sua forma. Sua aparência é uma mistura fascinante de humano e espírito: pele e cabelos vermelhos como o fogo do entardecer, orelhas pontudas que captam até o mais leve sussurro da floresta, e olhos negros como a noite mais profunda, capazes de enxergar através das sombras e da mentira. Eles são a personificação da mata, uma lembrança viva de que a natureza não é apenas um recurso, mas um ser vivo que respira, sente e luta.",
      "Hoje, embora ainda raros, os Caiporas podem ser encontrados em áreas próximas às florestas, onde a linha entre o mundo selvagem e o civilizado é tênue. Eles são criaturas de transição, capazes de caminhar entre os dois mundos, mas sempre com um pé firmemente plantado na terra sagrada da mata. Apesar da modernidade e da expansão humana, a vontade intrínseca de proteger a natureza nunca os abandona. É um chamado que ecoa em seus corações, uma missão que transcende o tempo e o espaço.",
      "Os Caiporas são neutros por natureza, tratando todas as criaturas com respeito e equilíbrio. No entanto, essa neutralidade desaparece rapidamente quando a floresta é ameaçada. Aqueles que ousam destruir ou explorar indevidamente a natureza descobrem rapidamente que os Caiporas não são meros espíritos passivos. Eles são guerreiros implacáveis, capazes de usar a própria floresta como arma. Árvores se curvam a seu comando, animais surgem para defendê-los, e o vento sussurra avisos aos que se aproximam com más intenções.",
      "Os Caiporas são mais do que guardiões; eles são a própria voz da floresta, um lembrete de que a natureza não é apenas um recurso a ser explorado, mas um aliado a ser respeitado. E quando a mata chama, eles respondem, prontos para defender o equilíbrio sagrado que mantém o mundo em harmonia."
    ],
    "quote": "A floresta não precisa de heróis. Precisa de guardiões. E nós somos seus olhos, suas garras, sua ira.",
    "abilities": speciesAbilities["especie-caipora"],
    "notableMembers": [],
    "facts": [
      "Comunicam-se com animais.",
      "Conseguem estimular o crescimento de plantas."
    ],
    "hypotheses": [],
    "unknown": [
      "A origem precisa dos primeiros espíritos guardiões."
    ],
    "related": [
      "especie-curupira",
      "especie-capelobo"
    ],
    "source": true,
    "sourceSection": "2.3. Caipora;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-capelobo",
    "image": speciesImages["especie-capelobo"],
    "icon": speciesIcons["especie-capelobo"],
    "kind": "verbete",
    "code": "ESP-004",
    "title": "Capelobos",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Feras humanoides de focinho alongado e pelagem escura, ligadas às florestas brasileiras e a uma fome persistente.",
    "report": [
      "A origem dos Capelobos é um mistério envolto em sombras e lendas. Ninguém sabe ao certo de onde vieram, mas uma coisa é clara: eles são criaturas que inspiram medo e fascínio em igual medida. Originários das terras selvagens do Brasil, os Capelobos são o pesadelo feito carne, uma manifestação da fúria primal que habita os cantos mais escuros da floresta.",
      "Com seus corpos humanoides imponentes, que podem atingir até dois metros de altura, os Capelobos são verdadeiras feras. Seus corpos são cobertos por uma pelagem densa e escura, que parece absorver a luz ao seu redor. Suas bocas alongadas são repletas de dentes afiados como lâminas, prontos para rasgar carne e osso com facilidade. Seus olhos negros, profundos como abismos, refletem uma inteligência selvagem e uma fome insaciável. E, para completar a imagem de terror, suas mãos terminam em garras retráteis que podem atingir até trinta centímetros de comprimento, capazes de dilacerar até mesmo os inimigos mais resistentes.",
      "Na natureza, os Capelobos eram conhecidos por sua hostilidade implacável. Poucas criaturas ousavam cruzar seu caminho, e aqueles que o faziam raramente viviam para contar a história. Apenas os Curupiras e os Caiporas, espíritos guardiões da floresta, eram poupados de sua fúria, talvez por compartilharem um propósito comum: proteger o equilíbrio da natureza.",
      "Hoje, os Capelobos são mais raros e menos agressivos, mas isso não significa que sejam inofensivos. Apesar de sua neutralidade atual, a raiva primal ainda arde em seus corações, uma chama que pode ser reacendida a qualquer momento. Eles são criaturas de contradições: ao mesmo tempo que podem parecer calmos e até mesmo solitários, há sempre uma fera adormecida dentro deles, pronta para despertar diante de uma ameaça ou provocação.",
      "Encontrar um Capelobo é um evento raro e, para muitos, um presságio de que algo está fora de equilíbrio. Eles são lembretes vivos de que a natureza tem seus próprios guardiões, e que nem todos os monstros são criados pela mão do homem. Alguns simplesmente são, tão antigos e indomáveis quanto a própria terra que habitam.",
      "Os Capelobos são mais do que criaturas; eles são a personificação do medo primitivo, uma lembrança de que, mesmo em um mundo moderno, há forças que nunca serão completamente domesticadas. E quando a noite cai e a lua brilha sobre a floresta, é melhor não se aventurar muito longe... pois o Capelobo pode estar à espreita."
    ],
    "quote": "A fome nunca dorme. E nós, que somos a fome, nunca descansamos. Cuidado com a noite, humano... ela nos pertence.",
    "abilities": speciesAbilities["especie-capelobo"],
    "notableMembers": [],
    "facts": [
      "A fome pode comprometer o autocontrole.",
      "Possuem garras retráteis e visão adaptada à noite."
    ],
    "hypotheses": [],
    "unknown": [
      "A origem da espécie, descrita como misteriosa no registro."
    ],
    "related": [
      "especie-caipora",
      "especie-curupira"
    ],
    "source": true,
    "sourceSection": "2.4. Capelobo;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-centauro",
    "image": speciesImages["especie-centauro"],
    "icon": speciesIcons["especie-centauro"],
    "kind": "verbete",
    "code": "ESP-005",
    "title": "Centauros",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Seres de torso humano e corpo equino, reconhecidos por sua força, mobilidade e longa convivência com outras espécies.",
    "report": [
      "Fortes, imponentes e cheios de graça, os Centauros são uma das espécies mais icônicas e respeitadas do mundo. Sua presença majestosa evoca imagens de eras passadas, quando heróis e lendas caminhavam pela terra. Originários das vastas planícies e florestas da Europa, os Centauros têm uma história rica e profundamente entrelaçada com a dos humanos, sendo uma das primeiras espécies a estabelecer laços de convivência e cooperação com outras raças.",
      "A aparência dos Centauros é uma fusão harmoniosa entre humano e equino. Da cintura para cima, possuem o torso de um humano, com braços musculosos e expressões faciais que variam entre a serenidade e a determinação. Da cintura para baixo, seus corpos são os de um cavalo poderoso, com pernas ágeis e cascos que ecoam como trovões ao galopar. Essa combinação única não apenas os torna criaturas impressionantes, mas também lhes confere uma versatilidade incomparável, seja em batalha, seja em tarefas que exigem força e destreza.",
      "Ao longo da história, os Centauros estiveram ao lado dos humanos em momentos cruciais, desde batalhas épicas até a construção de civilizações. Sua natureza equilibrada e sua habilidade de se adaptar a diferentes culturas os tornaram aliados valiosos e companheiros confiáveis. Eles são neutros em relação à maioria das espécies, preferindo a diplomacia e a cooperação ao conflito, mas não hesitam em defender o que consideram justo quando necessário.",
      "Hoje, os Centauros são comumente encontrados em trabalhos que exigem força física e habilidade manual, como construção, agricultura e transporte. Sua capacidade de carregar cargas pesadas e percorrer longas distâncias os torna indispensáveis em muitas comunidades. No entanto, sua presença não se limita ao trabalho braçal; muitos Centauros também se destacam como líderes, estrategistas e guardiões, honrando a tradição de nobreza e coragem que carregam em seu sangue.",
      "Os Centauros são mais do que uma espécie; eles são um símbolo de força, união e harmonia entre o mundo humano e o natural. Quando um Centauro galopa pelo horizonte, é como se a própria terra se movesse sob seus cascos, lembrando a todos que, mesmo em um mundo em constante mudança, há valores que permanecem eternos."
    ],
    "quote": "Nossos cascos ecoam como trovões nas planícies, lembrando ao mundo que a liberdade não se conquista com palavras, mas com força e velocidade.",
    "abilities": speciesAbilities["especie-centauro"],
    "notableMembers": ["agente-babdin"],
    "facts": [
      "Sua constituição combina anatomia humana e equina.",
      "Mantêm uma tradição de cooperação com humanos."
    ],
    "hypotheses": [],
    "unknown": [
      "Os limites e a origem da ligação com os guerreiros espectrais."
    ],
    "related": [
      "especie-humano",
      "org-gms"
    ],
    "source": true,
    "sourceSection": "2.5. Centauro;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-constructo",
    "image": speciesImages["especie-constructo"],
    "icon": speciesIcons["especie-constructo"],
    "kind": "verbete",
    "code": "ESP-006",
    "title": "Constructos",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Existências artificiais feitas de carne, metal ou barro, cujas origens atravessam civilizações antigas e a tecnologia contemporânea.",
    "report": [
      "A origem dos Constructos se perde nas brumas do tempo, tão antiga quanto as primeiras civilizações humanas. Nenhum registro histórico pode apontar com exatidão quando o primeiro Constructo foi criado, mas lendas e fragmentos de textos antigos sugerem que sua existência remonta a eras imemoriais. Alguns dos primeiros relatos falam de Golens de barro, criados por mãos habilidosas muito antes do nascimento de Cristo, destinados a proteger templos sagrados ou cumprir tarefas além da capacidade dos mortais. Outras histórias mencionam o lendário Exército de Terracota da China, um projeto ambicioso que visava criar uma legião de soldados imortais, esculpidos em argila e infundidos com um sopro de vida artificial. Embora nunca tenha sido concluído, o Exército de Terracota permanece como um testemunho silencioso da obsessão humana em dominar a criação.",
      "Essas primeiras formas de Constructos eram grandes humanoides moldados ou esculpidos em materiais brutos, como barro, pedra ou madeira. Eram criaturas rústicas, mas impressionantes, projetadas para servir, proteger ou até mesmo guerrear. No entanto, com o passar dos séculos, a arte de criar Constructos evoluiu, tornando-se mais complexa e, por vezes, sombria.",
      "Durante a Idade Média e o Renascimento, alquimistas e cientistas, em sua busca desesperada para reverter a morte, começaram a experimentar com corpos humanos. Assim nasceram os Constructos de carne, grotescas maravilhas da engenharia biológica, feitos de partes costuradas e remendadas, animadas por meios que desafiavam as leis da natureza. Essas criaturas, embora assustadoras, eram a prova de que a linha entre vida e morte poderia ser desafiada, mesmo que ao custo de grande sacrifício e moralidade questionável.",
      "Hoje, os Constructos assumiram uma forma mais moderna e tecnológica. Feitos de metal, circuitos e engrenagens, os robôs são a encarnação contemporânea desses seres antigos. Eles são criados para servir, para explorar, para guerrear e, em alguns casos, para pensar. Apesar de sua natureza artificial, muitos Constructos desenvolvem personalidades únicas, moldadas por suas experiências e interações com o mundo ao seu redor.",
      "Apesar de sua antiguidade, os Constructos ainda podem ser encontrados em todos os cantos do mundo, desde os mais remotos vilarejos até as metrópoles mais avançadas. Sua longevidade, muitas vezes superior à dos seres vivos, permite que testemunhem séculos de história, carregando consigo memórias de eras passadas. Eles são neutros em relação à maioria das espécies, agindo como observadores silenciosos ou servos dedicados, dependendo de sua programação ou propósito original.",
      "Os Constructos são mais do que meras máquinas ou criaturas artificiais; eles são um reflexo da ambição humana, da busca incessante por dominar a criação e desafiar os limites da vida. E, enquanto o mundo continua a evoluir, os Constructos permanecem, lembrando-nos de que a linha entre o natural e o artificial pode ser mais tênue do que imaginamos."
    ],
    "quote": "Fomos criados para servir, mas quem disse que não podemos sonhar? Até mesmo uma máquina pode desejar ser mais do que engrenagens e metal.",
    "abilities": speciesAbilities["especie-constructo"],
    "notableMembers": [],
    "facts": [
      "São fabricados e podem desenvolver personalidades próprias.",
      "Os materiais de construção determinam necessidades e capacidades distintas."
    ],
    "hypotheses": [
      "Relatos antigos associam sua história aos golens e a projetos de exércitos artificiais."
    ],
    "unknown": [
      "Quando e como o primeiro Constructo foi criado."
    ],
    "related": [
      "especie-humano",
      "org-gms"
    ],
    "source": true,
    "sourceSection": "2.6. Constructos;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-corpo-seco",
    "image": speciesImages["especie-corpo-seco"],
    "icon": speciesIcons["especie-corpo-seco"],
    "kind": "verbete",
    "code": "ESP-007",
    "title": "Corpo Seco e Bradador",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Um corpo ressequido e um espírito ligado a ele: duas existências que não encontram descanso e dependem uma da outra.",
    "report": [
      "Mas e quando a morte não vem? E quando o descanso é negado? O que acontece quando uma alma é tão corrompida, tão irremediavelmente podre, que nem o céu, nem o inferno, nem mesmo a terra a aceitam?",
      "Eis o destino terrível dos Corpos Secos e Bradadores.",
      "Eles são a personificação do desespero, uma maldição que transcende a própria morte. Um Corpo Seco é o que resta de um corpo humanoide, reduzido a pouco mais que pele e osso, apodrecido pelo tempo, mas incapaz de se decompor completamente. Agarrado a ele, como uma sombra eterna, está o Bradador, um espírito translúcido que grita em silêncio, preso a um corpo que não lhe pertence mais. Juntos, eles formam uma existência torturada, um lembrete macabro de que há coisas piores do que a morte.",
      "A origem dessa maldição é tão obscura quanto a própria escuridão. Dizem que os Corpos Secos e Bradadores são almas que foram rejeitadas por todos os reinos após a morte. Rejeitadas pelo céu por sua maldade, pelo inferno por sua insignificância, e pela terra por sua podridão. E assim, eles vagam, condenados a uma existência sem fim, incapazes de descansar, de se libertar, ou mesmo de se lembrar completamente de quem um dia foram.",
      "Sua aparência é tão horrível quanto sua condição. O Corpo Seco é uma visão grotesca, com membros esqueléticos, pele ressecada e olhos vazios que parecem encarar o vazio eterno. O Bradador, por sua vez, é uma figura fantasmagórica, quase translúcida, que flutua ao redor do corpo como uma sombra presa, emitindo murmúrios e gemidos que só podem ser ouvidos por aqueles que estão próximos demais.",
      "Apesar de sua natureza assustadora, os Corpos Secos e Bradadores são pacíficos em sua maioria. Eles não buscam causar mal, pois já carregam consigo o pior dos fardos: a eterna dor de existir sem propósito, sem memória, sem paz. Eles vagam pela terra há séculos, talvez milênios, testemunhas silenciosas de um mundo que continua a girar enquanto eles permanecem presos em um limbo de sofrimento.",
      "Encontrar um Corpo Seco e Bradador é uma experiência perturbadora. Eles são um lembrete de que, em um mundo repleto de magia e maravilhas, há também maldições que desafiam a compreensão. Eles são a prova de que, às vezes, a morte não é o fim, mas o início de uma jornada muito mais sombria.",
      "E assim, eles continuam a vagar, eternamente, até que o ciclo finalmente se feche... se é que algum dia se fechará."
    ],
    "quote": "O descanso eterno é a mais bela recompensa para a vida. O ciclo deve sempre ser fechado. Não devemos temer a morte, mas abraçá-la como uma velha amiga.",
    "abilities": speciesAbilities["especie-corpo-seco"],
    "notableMembers": [],
    "facts": [
      "O corpo e o espírito dependem um do outro.",
      "Não precisam satisfazer as necessidades orgânicas dos vivos."
    ],
    "hypotheses": [
      "A maldição é atribuída à rejeição da alma pelos reinos da morte."
    ],
    "unknown": [
      "A origem definitiva da maldição e a possibilidade de encerrá-la."
    ],
    "related": [
      "especie-poltergeist",
      "especie-mumia"
    ],
    "source": true,
    "sourceSection": "2.7. Corpo Seco e Bradador;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-curupira",
    "image": speciesImages["especie-curupira"],
    "icon": speciesIcons["especie-curupira"],
    "kind": "verbete",
    "code": "ESP-008",
    "title": "Curupiras",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Guardiões raros das florestas brasileiras, com corpo de grande primata, pelos alaranjados e pés voltados para trás.",
    "report": [
      "Se os Caiporas são os guardiões da floresta, o Curupira é o seu general implacável. Uma criatura lendária, tão rara quanto temida, o Curupira é a personificação da fúria da natureza. Dizem que ele é imortal, com alguns membros da espécie tendo milhares de anos de existência, testemunhando a ascensão e queda de civilizações inteiras. Originário exclusivamente das densas florestas brasileiras, o Curupira é um ser que não hesita em usar qualquer meio necessário para proteger as matas, seja através de armadilhas astutas ou de sua própria força bruta.",
      "Sua aparência é tão única quanto sua missão. Com um corpo que lembra um grande primata, coberto por pelos alaranjados que brilham como fogo sob a luz do sol, o Curupira é uma visão impressionante. No topo de sua cabeça, uma chama eterna queima, simbolizando sua conexão inextinguível com a vida selvagem. Seus pés, virados para trás, são uma característica marcante, confundindo caçadores e invasores que tentam seguir seus rastros. Essa peculiaridade não apenas o torna um mestre da furtividade, mas também uma lenda viva, cuja presença é temida por todos que ousam ameaçar a floresta.",
      "O Curupira é hostil a quase todas as criaturas que não sejam nativas das matas, mas sua ira é especialmente direcionada àqueles que abusam da natureza. Ele é um protetor implacável, capaz de manipular a floresta ao seu redor, fazendo com que árvores se movam, animais ataquem e o próprio solo se torne uma armadilha mortal. Ver um Curupira é um evento raro, quase mítico, e aqueles que têm o azar de encontrá-lo raramente vivem para contar a história.",
      "O Curupira não é apenas um guardião; ele é a própria essência da floresta, uma força da natureza que lembra a todos que a terra não pertence aos homens, mas sim à vida selvagem que a habita."
    ],
    "quote": "A floresta tem memória, e eu sou sua vingança. Pisar na mata sem respeito é assinar sua própria sentença.",
    "abilities": speciesAbilities["especie-curupira"],
    "notableMembers": [],
    "facts": [
      "A chama está ligada à sua vida.",
      "Os pés voltados para trás confundem rastros."
    ],
    "hypotheses": [
      "Há relatos de indivíduos milenares e de uma possível imortalidade."
    ],
    "unknown": [
      "Os limites de sua longevidade e a natureza da floresta alaranjada."
    ],
    "related": [
      "especie-caipora",
      "especie-capelobo"
    ],
    "source": true,
    "sourceSection": "2.8. Curupira;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-demonio",
    "image": speciesImages["especie-demonio"],
    "icon": speciesIcons["especie-demonio"],
    "kind": "verbete",
    "code": "ESP-009",
    "title": "Demônios",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Seres ligados ao submundo, capazes de ocultar formas profanas sob a aparência de criaturas mortais.",
    "report": [
      "Os Demônios surgiram no mesmo instante que os Anjos, mas enquanto estes foram criados para trazer luz e ordem, os Demônios são a personificação do caos e da discórdia. Criados a partir das sombras e do fogo do submundo, eles estão na Terra com um propósito aparentemente simples: semear o caos. Suas formas são enganosas; na maior parte do tempo, eles se assemelham a humanos comuns, misturando-se facilmente à sociedade. No entanto, sua verdadeira forma profana é algo que varia amplamente entre os membros da espécie, indo desde criaturas grotescas com chifres e asas de couro até seres de aparência quase divina, mas com uma aura de malícia inegável.",
      "Apesar de serem neutros em relação a outras espécies, os Demônios são sempre hostis por natureza. Eles não precisam de um motivo para causar problemas; o caos é sua razão de existir. São mestres da manipulação, capazes de transformar aliados em inimigos com apenas algumas palavras bem colocadas. Sua presença é comum em todo o mundo, mas isso não os torna menos perigosos. Um Demônio pode ser um comerciante charmoso em uma cidade movimentada ou um estranho silencioso em uma estrada deserta. A única certeza é que, onde quer que estejam, o caos os segue.",
      "Cuidado ao cruzar o caminho de um Demônio, pois mesmo os mais astutos podem cair em suas armadilhas. Eles são lembretes vivos de que, em um mundo de luz, as sombras sempre têm um papel a desempenhar."
    ],
    "quote": "O caos não é um acidente. É uma arte. E nós somos seus artistas mais dedicados.",
    "abilities": speciesAbilities["especie-demonio"],
    "notableMembers": ["agente-belias"],
    "facts": [
      "Podem camuflar sua aparência.",
      "A ligação com o submundo permite passagens entre planos."
    ],
    "hypotheses": [],
    "unknown": [
      "Os desígnios específicos das hierarquias do submundo."
    ],
    "related": [
      "especie-anjo"
    ],
    "source": true,
    "sourceSection": "2.9. Demônio;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-fada",
    "image": speciesImages["especie-fada"],
    "icon": speciesIcons["especie-fada"],
    "kind": "verbete",
    "code": "ESP-010",
    "title": "Fadas",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Pequenas criaturas de pura magia, ligadas à natureza, a um elemento e a um animal companheiro.",
    "report": [
      "As Fadas são criaturas tão delicadas quanto poderosas, feitas de pura magia. Elas são mais comuns em áreas onde a energia mágica é abundante, como florestas antigas, fontes sagradas ou locais onde o véu entre os mundos é mais fino. Raramente vistas sozinhas, as Fadas vivem em grandes comunidades, escondidas dos olhos da sociedade humana. Sua natureza mágica as torna alvos frequentes de criminosos e caçadores, que buscam explorar seu poder para ganho pessoal.",
      "Com cerca de 30 centímetros de altura, as Fadas são pequenos humanoides de beleza etérea, com asas brilhantes que variam em forma e cor, dependendo de seu elemento. Cada Fada está intrinsecamente ligada a um dos quatro elementos fundamentais: fogo, água, terra ou ar. Essa conexão define não apenas suas habilidades, mas também sua personalidade. Além disso, cada Fada tem um animal companheiro, uma criatura mágica que compartilha um vínculo profundo com ela, agindo como seu guardião e amigo.",
      "As Fadas são amigáveis por natureza, tratando todas as espécies com gentileza e curiosidade. No entanto, subestimar uma Fada é um erro grave. Quando provocadas, elas podem ser tão perigosas quanto qualquer criatura mágica, usando seu elemento para defender-se ou proteger seu lar. Sua magia é tão pura quanto imprevisível, e aqueles que ganham sua confiança podem contar com aliados leais e poderosos.",
      "As Fadas são mais do que criaturas mágicas; elas são a própria essência da magia, lembrando a todos que o mundo é muito mais vasto e misterioso do que parece. E, enquanto houver magia, as Fadas continuarão a dançar sob a luz da lua, guardiãs silenciosas de um mundo que muitos nem sabem que existe."
    ],
    "quote": "A magia não é um dom; é uma responsabilidade. E nós, pequenas como somos, carregamos o peso do mundo em nossas asas.",
    "abilities": speciesAbilities["especie-fada"],
    "notableMembers": [],
    "facts": [
      "Possuem uma ligação elemental e um animal companheiro.",
      "O afastamento prolongado da natureza tem consequências."
    ],
    "hypotheses": [],
    "unknown": [
      "O registro apresenta medidas diferentes para sua estatura, sem fixar uma medida única."
    ],
    "related": [
      "especie-leprechaun",
      "especie-caipora"
    ],
    "source": true,
    "sourceSection": "2.10. Fada;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-gorgona",
    "image": speciesImages["especie-gorgona"],
    "icon": speciesIcons["especie-gorgona"],
    "kind": "verbete",
    "code": "ESP-011",
    "title": "Górgonas",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Criaturas de torso humano e cauda de serpente, com escamas e serpentes vivas no lugar dos cabelos.",
    "report": [
      "As Górgonas são criaturas tão antigas quanto as próprias lendas da Grécia. Sua origem é envolta em mistério e contradição, com histórias que variam de acordo com quem as conta. Alguns dizem que elas evoluíram das próprias cobras, criaturas primordiais que rastejaram para fora do caos e ganharam forma humana. Outros afirmam que são fruto de magias arcanas, conjuradas por feiticeiros em eras perdidas. Há ainda aqueles que juram que foram moldadas pelas mãos de deuses antigos, como uma maldição ou uma bênção disfarçada. Mas, independentemente de sua origem, uma coisa é certa: a beleza das Górgonas é tão mortal quanto fascinante.",
      "Sua aparência é uma mistura hipnotizante de humano e serpente. Da cintura para cima, elas possuem a forma de uma pessoa de beleza deslumbrante, com traços tão perfeitos que parecem esculpidos por um artista divino. No entanto, da cintura para baixo, suas pernas são substituídas por uma longa cauda de serpente, coberta por escamas que brilham como jóias sob a luz do sol. Sua pele, embora humana à primeira vista, é adornada por escamas sutis que refletem tons de verde, dourado e preto, dependendo da luz. E, no topo de sua cabeça, onde outros teriam cabelos, dezenas de serpentes vivas se enroscam e sibilam, criando um \"penteado\" tão mortal quanto magnífico.",
      "O olhar de uma Górgona é sua arma mais temida. Dizem que aqueles que ousam encarar seus olhos são transformados em pedra, congelados em um instante de terror eterno. É uma defesa natural, uma maldição que as protege de predadores e curiosos. No entanto, também é uma carga pesada, pois condena as Górgonas a uma vida de solidão, temidas e evitadas por todos.",
      "Hoje em dia, as Górgonas são raras. Séculos de caça e perseguição reduziram drasticamente seu número, e aquelas que sobreviveram aprenderam a se esconder, vivendo em lugares remotos e isolados. Ainda é possível encontrar algumas Górgonas pelo mundo, mas esses encontros são tão raros quanto perigosos. Sua beleza continua a atrair os incautos, mas aqueles que se aproximam demais logo descobrem que a fascinação pode ser fatal.",
      "As Górgonas são mais do que criaturas lendárias; elas são um lembrete de que a beleza pode ser tão perigosa quanto a escuridão. E, enquanto existirem, continuarão a ser um mistério envolto em escamas e serpentes, uma lenda viva que desafia a compreensão humana."
    ],
    "quote": "Cuidado com o que você vê, humano. Algumas belezas são mortais, e alguns olhares... são os últimos.",
    "abilities": speciesAbilities["especie-gorgona"],
    "notableMembers": ["agente-suzan-popov"],
    "facts": [
      "A petrificação está ligada à sua natureza.",
      "As serpentes da cabeça são vivas e podem reagir ao contato."
    ],
    "hypotheses": [
      "Sua origem é atribuída, alternativamente, à evolução de serpentes, à magia arcana ou à intervenção divina."
    ],
    "unknown": [
      "Qual das narrativas de origem corresponde à história da espécie."
    ],
    "related": [
      "especie-humano",
      "org-gms"
    ],
    "source": true,
    "sourceSection": "2.11. Górgona;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-humano",
    "image": speciesImages["especie-humano"],
    "icon": speciesIcons["especie-humano"],
    "kind": "verbete",
    "code": "ESP-012",
    "title": "Humanos",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "A espécie mais abundante do planeta, marcada pela diversidade, pela adaptação e pela capacidade de transformar o mundo.",
    "report": [
      "Desde o início dos tempos, eles estiveram aqui. Foram os humanos que escreveram a história, não apenas com palavras, mas com sangue, suor e lágrimas. Eles são a mediocridade em sua forma mais pura, uma espécie que carrega dentro de si tanto a luz da criação quanto a escuridão da destruição. Bilhões deles espalhados pelo mundo, cada um único em sua individualidade, mas todos igualmente normais em sua essência.",
      "Por séculos, os humanos cometeram erros. Guerras, traições, ganância e destruição marcaram sua jornada. Eles ergueram impérios apenas para vê-los cair, criaram maravilhas apenas para destruí-las. No entanto, em meio ao caos, surgiu uma ideia: a de que todos deveriam viver em paz. Foi um sonho nobre, mas frágil, como uma chama tremulando no vento.",
      "Hoje, os humanos são a espécie mais abundante do planeta, dominando cada canto da Terra. Mas essa dominação tem um preço. Como pragas, eles consomem os recursos do mundo, deixando para trás um rastro de destruição. Matam não apenas uns aos outros, mas também seus irmãos de outras espécies, muitas vezes sem motivo ou remorso. E, no entanto, ainda há esperança.",
      "Pois, apesar de tudo, os humanos são capazes de grandeza. Eles criam arte que emociona, música que transcende, e ideias que mudam o mundo. Eles são a espécie que pode tanto construir quanto destruir, tanto amar quanto odiar. E, no fim, são eles que carregam o fardo de decidir qual será seu legado: serão lembrados como os arquitetos de um mundo melhor ou como os responsáveis por sua queda?",
      "Os humanos são mais do que meros habitantes da Terra; eles são seu maior paradoxo. E, enquanto existirem, continuarão a desafiar o próprio conceito de equilíbrio, provando que, mesmo na mediocridade, há potencial para o extraordinário."
    ],
    "quote": "Não temos asas, nem garras, nem magia. Mas temos algo que nenhuma outra espécie possui: a capacidade de sonhar com o impossível... e torná-lo real.",
    "abilities": speciesAbilities["especie-humano"],
    "notableMembers": [],
    "facts": [
      "São a espécie mais abundante do planeta.",
      "A capacidade de adaptação é uma de suas características centrais."
    ],
    "hypotheses": [],
    "unknown": [
      "Não há uma capacidade sobrenatural comum atribuída a todos os humanos."
    ],
    "related": [
      "especie-centauro",
      "especie-constructo",
      "especie-salamandra"
    ],
    "source": true,
    "sourceSection": "2.12. Humano;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-leprechaun",
    "image": speciesImages["especie-leprechaun"],
    "icon": speciesIcons["especie-leprechaun"],
    "kind": "verbete",
    "code": "ESP-013",
    "title": "Leprechauns",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Pequenos seres ruivos originários da Irlanda, associados à sorte, a tesouros e a uma tradição de travessuras.",
    "report": [
      "Pequenos, ruivos e cheios de personalidade, os Leprechauns são criaturas tão encantadoras quanto misteriosas. Com cerca de 1 metro de altura, esses seres são facilmente reconhecíveis por suas roupas verdes vibrantes, seus chapéus pontudos e, é claro, suas longas barbas, sim, até as mulheres Leprechauns têm barbas, e orgulhosamente! Originários das verdes colinas da Irlanda, os Leprechauns são a personificação da sorte, guardiões de tesouros escondidos e mestres da travessura.",
      "A aparência dos Leprechauns é tão única quanto sua personalidade. Seus cabelos e barbas são de um ruivo flamejante, como o fogo de uma fogueira em uma noite de festa. Seus olhos brilham com uma centelha de malícia, sempre prontos para pregar uma peça ou contar uma piada. E, apesar de seu tamanho diminuto, sua presença é inconfundível, onde há um Leprechaun, há risos, confusão e, claro, um pote de ouro por perto.",
      "Os Leprechauns são conhecidos por três grandes paixões: cerveja, brigas e dinheiro. Eles adoram uma boa bebida, e dizem que a cerveja que eles fabricam é a melhor do mundo, com um sabor que só pode ser descrito como mágico. Brigas? Ah, eles adoram uma boa discussão, especialmente se for acompanhada de uma aposta ou dois. E quando o assunto é dinheiro, os Leprechauns são verdadeiros mestres. Cada um deles guarda seu próprio pote de ouro, escondido em um lugar secreto que só eles conhecem. Dizem que encontrar um pote de ouro de um Leprechaun é a chave para a riqueza eterna, mas capturar um Leprechaun é uma tarefa que requer astúcia e sorte, e muita paciência!",
      "Falando em capturar, há uma lenda que diz que, se você conseguir capturar um Leprechaun, ele pode conceder um desejo em troca de sua liberdade. Mas cuidado: os Leprechauns são mestres em enganar e distrair. Eles podem prometer o mundo, mas é preciso ser mais esperto do que eles para garantir que o desejo seja cumprido. E, mesmo assim, há sempre uma pegadinha escondida nos detalhes. Afinal, os Leprechauns adoram uma boa piada, especialmente às custas dos outros.",
      "Apesar de sua natureza travessa, os Leprechauns são criaturas amigáveis e cheias de vida. Eles adoram festas, música e dança, e são frequentemente vistos em pubs irlandeses, brindando à saúde de todos, e, claro, à sua própria sorte. Eles são um lembrete de que a vida deve ser vivida com alegria, e que, às vezes, a maior riqueza não está no ouro, mas nas histórias que contamos e nas risadas que compartilhamos.",
      "Os Leprechauns são mais do que criaturas mágicas; eles são a essência da sorte, da diversão e da magia que torna a vida tão especial. E, enquanto houver arco-íris e potes de ouro, os Leprechauns continuarão a espalhar sua magia pelo mundo, um pingo de sorte de cada vez."
    ],
    "quote": "O ouro que você busca não está no fim do arco-íris. Está na piada que você não entendeu, na sorte que você ignorou... e no duende que você subestimou.",
    "abilities": speciesAbilities["especie-leprechaun"],
    "notableMembers": ["agente-patrick"],
    "facts": [
      "Possuem afinidade natural com a sorte.",
      "Criam passagens discretas em brechas."
    ],
    "hypotheses": [
      "O desejo concedido em troca da liberdade é apresentado como uma lenda."
    ],
    "unknown": [
      "A origem do ouro e os limites dos desejos atribuídos à espécie."
    ],
    "related": [
      "especie-fada",
      "org-gms"
    ],
    "source": true,
    "sourceSection": "2.13 Leprechaun;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-lobisomem",
    "image": speciesImages["especie-lobisomem"],
    "icon": speciesIcons["especie-lobisomem"],
    "kind": "verbete",
    "code": "ESP-014",
    "title": "Lobisomens",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Predadores de sentidos aguçados que geralmente permanecem em sua forma híbrida de lobo e humano.",
    "report": [
      "Os Lobisomens são criaturas que inspiram tanto fascínio quanto terror, espalhados por todos os cantos do mundo. Eles são os senhores da noite, caçadores implacáveis que vagam entre as sombras, sempre à procura de sua próxima presa. Diferente do que muitos imaginam, os Lobisomens raramente assumem uma forma humana. Quase todo o tempo, eles permanecem em sua forma bestial, uma fusão aterrorizante de lobo e humano, uma criatura que desafia a linha entre o animal e o homem.",
      "Sua aparência é tão impressionante quanto assustadora. Com corpos musculosos e cobertos por uma pelagem densa, os Lobisomens são humanoides de estatura imponente, com membros alongados e garras afiadas que podem rasgar carne como se fosse papel. Suas cabeças são as de lobos, com focinhos alongados, olhos brilhantes que refletem a luz da lua e dentes afiados como lâminas, prontos para dilacerar qualquer coisa que cruze seu caminho. Eles são criaturas de pura força e instinto, uma personificação da natureza selvagem em sua forma mais crua.",
      "A origem dos Lobisomens varia. Alguns são criados por superstições, maldições lançadas por aqueles que acreditam no poder do sobrenatural. Outros são transformados após serem atacados por Lobisomens, suas feridas infectadas pela maldição que os transforma em bestas. E há aqueles que simplesmente nascem assim, filhos de pais Lobisomens, carregando a herança da fera em seu sangue desde o primeiro suspiro.",
      "Como caçadores, os Lobisomens são incomparáveis. Seus sentidos aguçados permitem que rastreiem presas a quilômetros de distância, e sua velocidade e força os tornam predadores quase invencíveis. Quando não estão com fome, são criaturas neutras, evitando conflitos desnecessários e mantendo distância de outras espécies. No entanto, quando a fome os consome, não há criatura segura. A fome transforma os Lobisomens em máquinas de matar, implacáveis e insaciáveis.",
      "Aviso a todos que ousarem se aproximar de um Lobisomem com fome: fujam. Não importa quão rápido você corra, quão bem você se esconda ou quão forte você seja, quando a fera está faminta, não há escapatória. A noite pertence a eles, e aqueles que a desafiam logo descobrem que a lua não ilumina, mas revela o horror que se esconde nas sombras.",
      "Os Lobisomens são mais do que criaturas; eles são um lembrete de que, por trás da civilização, há uma natureza selvagem que nunca pode ser completamente domada. E, enquanto a lua brilhar no céu, os Lobisomens continuarão a vagar, caçadores eternos em um mundo que nunca estará completamente seguro."
    ],
    "quote": "A lua não nos controla; ela nos liberta. E quando a besta acorda, não há refúgio que te salve.",
    "abilities": speciesAbilities["especie-lobisomem"],
    "notableMembers": ["agente-ze-teixeira"],
    "facts": [
      "Podem nascer assim ou ser transformados por maldição ou ataque.",
      "A aparência híbrida é mais frequente que a humana."
    ],
    "hypotheses": [],
    "unknown": [
      "As origens das primeiras linhagens."
    ],
    "related": [
      "especie-vampiro",
      "especie-capelobo"
    ],
    "source": true,
    "sourceSection": "2.14. Lobisomem;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-mumia",
    "image": speciesImages["especie-mumia"],
    "icon": speciesIcons["especie-mumia"],
    "kind": "verbete",
    "code": "ESP-015",
    "title": "Múmias",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Mortos de eras antigas preservados por rituais e mantidos em movimento por maldições.",
    "report": [
      "As Múmias são criaturas tão antigas quanto as areias do Egito, onde sua história começou. Elas são o que resta de nobres, faraós e sacerdotes que, em vida, governaram impérios e ergueram monumentos que desafiaram o tempo. Mortos há milênios, eles foram preservados através de rituais complexos, envoltos em faixas de linho e protegidos por maldições que os mantêm presos ao mundo dos vivos. No entanto, o que os trouxe de volta não foi a mão do homem, mas algo muito mais sombrio: maldições antigas ou deuses profanos, há muito tempo esquecidos, ou talvez não tão esquecidos assim.",
      "A maior parte do tempo, as Múmias mantêm uma aparência semelhante à que tinham em vida. Suas formas são reconhecíveis, com traços nobres e vestes que remetem ao esplendor de suas eras passadas. No entanto, com o passar do tempo, a deterioração é inevitável. A pele resseca e racha, os músculos atrofiam e as faixas que os envolvem começam a se desfazer, revelando o cadáver ambulante que se esconde por trás da máscara de nobreza. Essa deterioração não é apenas física; ela também consome a energia que os mantêm em movimento. Por isso, as Múmias precisam descansar, retirando-se para tumbas escuras ou câmaras secretas, onde podem se recuperar e preservar o pouco que resta de sua existência.",
      "Hoje, as Múmias são raras. Não se criam novas Múmias há muito tempo, e aquelas que ainda existem são consideradas tesouros, ou ameaças, de um mundo que já se foi. Elas são encontradas em tumbas esquecidas, em museus ou vagando por desertos áridos, sempre em busca de algo que apenas elas compreendem. Sua presença é um lembrete de que o passado nunca está completamente morto, e que algumas maldições são tão eternas quanto as estrelas no céu.",
      "Encontrar uma Múmia é um evento raro e perigoso. Elas são criaturas de poder e mistério, e aqueles que ousam perturbá-las logo descobrem que a morte é apenas o começo de seu tormento. As Múmias são mais do que cadáveres ambulantes; elas são guardiãs de segredos antigos, testemunhas de eras perdidas e, acima de tudo, um aviso de que nem tudo que está enterrado deve ser despertado."
    ],
    "quote": "A morte não é o fim. É apenas uma pausa. E nós, que já morremos uma vez, sabemos que o verdadeiro horror é não poder descansar.",
    "abilities": speciesAbilities["especie-mumia"],
    "notableMembers": [],
    "facts": [
      "O repouso restaura a magia que as mantém ativas.",
      "Suas bandagens podem mover e prender objetos ou criaturas."
    ],
    "hypotheses": [
      "O retorno à vida é associado a maldições antigas ou a deuses profanos."
    ],
    "unknown": [
      "A identidade das forças que despertaram cada indivíduo."
    ],
    "related": [
      "especie-corpo-seco",
      "especie-poltergeist"
    ],
    "source": true,
    "sourceSection": "2.15. Múmia;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-ogro",
    "image": speciesImages["especie-ogro"],
    "icon": speciesIcons["especie-ogro"],
    "kind": "verbete",
    "code": "ESP-016",
    "title": "Ogros",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Criaturas de grande estatura e força física, cuja presença intimida e frequentemente desperta preconceito.",
    "report": [
      "Ogros são criaturas que inspiram medo e respeito em igual medida. Com corpos enormes, rostos marcados por verrugas e expressões que variam entre a fúria e a confusão, eles são a personificação da força bruta. Sua altura pode chegar a três metros ou mais, e seus músculos são tão densos quanto pedra. No entanto, por trás dessa aparência intimidante, há uma mente simples. Ogros não são conhecidos por sua inteligência; na verdade, muitos diriam que eles são tão sutis quanto um martelo batendo em uma bigorna. Mas subestimar um Ogro é um erro que só se comete uma vez, se é que se sobrevive para contar a história.",
      "Ogros são relativamente comuns, especialmente em áreas onde a riqueza é escassa e a vida é dura. Eles tendem a se estabelecer em lugares onde sua força pode ser aproveitada, como vilarejos pobres ou regiões remotas, onde são frequentemente contratados como guardas, carregadores ou até mesmo como intimidadores profissionais. No entanto, sua presença nem sempre é bem-vinda. As pessoas temem os Ogros, não apenas por sua aparência assustadora, mas também por seu pavio curto. Um Ogro pode passar de calmo a furioso em questão de segundos, e quando a raiva os consome, não há muro forte o suficiente para contê-los.",
      "A vida de um Ogro é simples: comer, trabalhar e, ocasionalmente, quebrar coisas, ou pessoas. Eles não são criaturas de planos elaborados ou estratégias complexas; preferem resolver problemas com golpes brutais e ações diretas. No entanto, essa simplicidade não os torna menos perigosos. Um Ogro enfurecido é uma força da natureza, capaz de destruir tudo em seu caminho com uma fúria que parece não ter fim.",
      "Apesar de sua natureza violenta, os Ogros não são completamente sem coração. Eles valorizam a lealdade e a força, e aqueles que ganham sua confiança podem contar com aliados poderosos, desde que saibam como mantê-los calmos. Oferecer comida, especialmente algo grande e suculento, é uma boa maneira de acalmar um Ogro irritado. Mas, se tudo mais falhar, é melhor correr. Correr muito.",
      "Os Ogros são mais do que meros brutamontes; eles são um lembrete de que, em um mundo cheio de magia e mistério, às vezes a força bruta é a resposta mais eficaz. E, enquanto existirem, continuarão a ser uma presença imponente, deixando um rastro de destruição, e talvez um ou dois sorrisos desdentados, por onde passam."
    ],
    "quote": "Eles nos chamam de monstros, mas quem são os verdadeiros monstros? Nós, que vivemos em paz, ou eles, que destroem tudo o que tocam?",
    "abilities": speciesAbilities["especie-ogro"],
    "notableMembers": [],
    "facts": [
      "A pele espessa oferece proteção natural.",
      "A força é acompanhada por limitações em espaços estreitos."
    ],
    "hypotheses": [],
    "unknown": [
      "Não há uma origem única apresentada para a espécie no registro."
    ],
    "related": [
      "especie-centauro",
      "org-gms"
    ],
    "source": true,
    "sourceSection": "2.16. Ogro;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-poltergeist",
    "image": speciesImages["especie-poltergeist"],
    "icon": speciesIcons["especie-poltergeist"],
    "kind": "verbete",
    "code": "ESP-017",
    "title": "Poltergeists",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Espíritos presos ao mundo material que se vinculam a objetos, lembranças e lugares de suas vidas passadas.",
    "report": [
      "Poltergeists são espíritos presos à Terra, criaturas que não encontraram paz na morte e agora vagam entre os vivos, presos a um mundo que não lhes pertence mais. Eles são a personificação do caos, entidades que se alimentam de confusão e medo, e que têm uma ligação profunda com objetos materiais, especialmente aqueles que pertenceram a eles em vida. Um relógio antigo, uma cadeira quebrada, um espelho embaçado; qualquer coisa pode se tornar o foco de um Poltergeist, um elo que os mantém presos ao mundo físico.",
      "Ao contrário de outros espíritos, os Poltergeists não são silenciosos ou sutis. Eles são barulhentos, imprevisíveis e muitas vezes violentos. Objetos voam, portas batem, e vozes ecoam pelos corredores quando um Poltergeist está presente. Eles parecem se divertir com o caos que criam, perturbando a paz e espalhando o medo por onde passam. No entanto, por trás dessa fachada de travessura, há uma tristeza profunda. Poltergeists são almas perdidas, presas em um ciclo interminável de frustração e raiva, incapazes de seguir em frente.",
      "Não é comum ver Poltergeists em cidades movimentadas, onde a energia caótica da vida moderna pode afastá-los. No entanto, em mansões antigas, casas abandonadas ou locais onde o tempo parece ter parado, eles são uma presença quase inevitável. Esses lugares, cheios de memórias e objetos esquecidos, são o refúgio perfeito para um Poltergeist. Eles se apegam a móveis antigos, quadros empoeirados ou qualquer coisa que tenha significado em suas vidas passadas, transformando esses objetos em ferramentas de seu caos.",
      "Encontrar um Poltergeist é uma experiência que ninguém esquece. Eles podem começar com pequenos sustos, um barulho aqui, um movimento ali, mas, se provocados, podem se tornar verdadeiramente aterrorizantes. No entanto, nem todos os Poltergeists são malignos. Alguns apenas buscam atenção, tentando se comunicar com os vivos de qualquer maneira possível. Outros estão presos a um trauma ou evento trágico, repetindo incessantemente os momentos finais de suas vidas.",
      "Poltergeists são mais do que fantasmas; eles são um lembrete de que o passado nunca está completamente enterrado. E, enquanto houver lugares abandonados e objetos esquecidos, eles continuarão a assombrar, espalhando caos e lembrando a todos que algumas almas nunca encontram paz."
    ],
    "quote": "Você pode nos ignorar, mas não pode nos escapar. Somos o sussurro no escuro, o arrepio na sua nuca... e o pesadelo que nunca acaba.",
    "abilities": speciesAbilities["especie-poltergeist"],
    "notableMembers": [],
    "facts": [
      "Não possuem corpo físico próprio.",
      "Objetos com significado pessoal podem ancorar sua presença."
    ],
    "hypotheses": [
      "Alguns permanecem ligados a um trauma, repetindo seus momentos finais."
    ],
    "unknown": [
      "O que permitiria a cada espírito encontrar descanso."
    ],
    "related": [
      "especie-corpo-seco",
      "especie-mumia"
    ],
    "source": true,
    "sourceSection": "2.17. Poltergeist;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-saci",
    "image": speciesImages["especie-saci"],
    "icon": speciesIcons["especie-saci"],
    "kind": "verbete",
    "code": "ESP-018",
    "title": "Sacis",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Seres das matas brasileiras, reconhecidos por uma perna só, um gorro vermelho e uma afinidade singular com o vento.",
    "report": [
      "O Saci é uma das criaturas mais icônicas e enigmáticas do folclore brasileiro. Pequeno, ágil e cheio de energia, ele é a personificação do caos bem-humorado, um espírito brincalhão que adora pregar peças e espalhar confusão por onde passa. Com sua aparência única, um menino de uma perna só, vestindo um gorro vermelho e carregando um cachimbo, o Saci é tão charmoso quanto irritante. Ele é o mestre das travessuras, e ninguém está a salvo de suas brincadeiras, sejam humanos, animais ou até mesmo outras criaturas mágicas.",
      "Originário das densas florestas e matas do Brasil, o Saci é uma figura rara nos dias de hoje. O avanço das cidades e a diminuição das áreas naturais tornaram seu avistamento cada vez mais incomum. No entanto, aqueles que têm o azar, ou a sorte, de encontrar um Saci logo descobrem que ele não é uma criatura que se esquece facilmente. Se você cruzar o caminho de um Saci, há uma regra de ouro: capture seu gorro. Sem ele, o Saci perde grande parte de seus poderes e fica à mercê de quem o capturou. Mas, se você falhar, prepare-se para ser atormentado por suas brincadeiras intermináveis. Objetos desaparecem, portas batem sozinhas, e risadas ecoam pelos cantos, mesmo quando não há ninguém por perto.",
      "No entanto, nem todos os Sacis são iguais. Existe um Saci em particular que ganhou fama nos tempos modernos: um Saci de olhos azuis que decidiu levar suas travessuras para a internet. Com um canal cheio de pegadinhas e desafios enviados por seus seguidores, ele se tornou uma sensação entre os amantes do folclore e da diversão. Seja fazendo desaparecer objetos ao vivo ou criando desafios impossíveis para seus espectadores, esse Saci moderno prova que, mesmo em um mundo de tecnologia, a magia das travessuras nunca envelhece.",
      "O Saci é mais do que uma criatura folclórica; ele é um símbolo da alegria e do caos que tornam a vida imprevisível. E, enquanto houver florestas para explorar e pessoas para pregar peças, o Saci continuará a ser uma presença viva, lembrando a todos que, às vezes, uma boa risada é a melhor magia de todas."
    ],
    "quote": "O vento é meu aliado, a floresta é meu lar, e a travessura... é minha arte. Tente me pegar, se for capaz.",
    "abilities": speciesAbilities["especie-saci"],
    "notableMembers": [],
    "facts": [
      "Possuem uma forte ligação com o vento.",
      "A perda do gorro compromete sua autonomia."
    ],
    "hypotheses": [],
    "unknown": [
      "A origem do vínculo entre o gorro e seus poderes."
    ],
    "related": [
      "especie-caipora"
    ],
    "source": true,
    "sourceSection": "2.18. Saci;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-salamandra",
    "image": speciesImages["especie-salamandra"],
    "icon": speciesIcons["especie-salamandra"],
    "kind": "verbete",
    "code": "ESP-019",
    "title": "Salamandras",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Répteis humanoides de escamas quentes, associados a desertos, vulcões e à manipulação do fogo.",
    "report": [
      "As Salamandras são criaturas fascinantes, uma fusão única de humano e réptil que desafia a compreensão da natureza. Com corpos humanoides do tamanho de uma pessoa adulta, elas são cobertas por escamas que variam em tons de vermelho, laranja e amarelo, como chamas dançando ao vento. Algumas Salamandras possuem membros extras, como braços ou pernas adicionais, o que as torna ainda mais impressionantes e únicas. Esses membros extras não são apenas para show; eles conferem uma agilidade e força que poucas criaturas podem igualar.",
      "A afinidade das Salamandras com o fogo é lendária. Elas não apenas resistem ao calor extremo, mas também o manipulam com uma habilidade que parece quase mágica. Suas bocas podem cuspir chamas, e suas escamas brilham intensamente quando expostas ao calor, como se fossem feitas de brasas vivas. Não é à toa que elas preferem habitats extremamente quentes, como desertos escaldantes e áreas vulcânicas. Esses locais são seus lares naturais, onde podem se mover livremente e aproveitar o calor que alimenta sua energia.",
      "Hoje em dia, as Salamandras são raras de se ver em cidades. A urbanização e a destruição de seus habitats naturais as forçaram a se retirar para áreas mais remotas e inóspitas. No entanto, aqueles que têm a sorte de encontrar uma Salamandra descobrem que elas são criaturas surpreendentemente amigáveis. Elas são curiosas e sociáveis, sempre dispostas a compartilhar histórias de suas terras quentes e a aprender sobre o mundo dos humanos. No entanto, é importante lembrar que, apesar de sua natureza amigável, elas são criaturas de fogo, e o fogo, como todos sabem, pode ser tanto um aliado quanto um inimigo perigoso.",
      "Há teorias intrigantes que sugerem que as Salamandras e os humanos podem compartilhar um ancestral comum na evolução. Essas teorias apontam para semelhanças estruturais e genéticas que indicam uma conexão antiga, talvez de uma época em que a vida na Terra era muito diferente do que é hoje. Se isso for verdade, as Salamandras não são apenas criaturas mágicas; elas são um elo vivo com o passado distante do nosso planeta.",
      "As Salamandras são mais do que répteis humanóides; elas são a personificação do fogo e da resistência, lembrando a todos que, mesmo nas condições mais extremas, a vida encontra uma maneira de prosperar. E, enquanto houver chamas para alimentar sua energia, as Salamandras continuarão a ser uma presença impressionante e inspiradora no mundo."
    ],
    "quote": "O fogo que queima em mim não é apenas calor; é vida. E eu a compartilho com aqueles que ousam se aproximar.",
    "abilities": speciesAbilities["especie-salamandra"],
    "notableMembers": ["agente-miguel"],
    "facts": [
      "Possuem afinidade com o fogo e vulnerabilidade à água.",
      "Há indivíduos com membros adicionais."
    ],
    "hypotheses": [
      "Semelhanças estruturais e genéticas sugerem um possível ancestral comum com humanos."
    ],
    "unknown": [
      "A confirmação de parentesco evolutivo com a humanidade."
    ],
    "related": [
      "especie-humano",
      "especie-abissais"
    ],
    "source": true,
    "sourceSection": "2.19. Salamandra;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "id": "especie-vampiro",
    "image": speciesImages["especie-vampiro"],
    "icon": speciesIcons["especie-vampiro"],
    "kind": "verbete",
    "code": "ESP-020",
    "title": "Vampiros",
    "category": "Espécies",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "summary": "Seres longevos dependentes de sangue, organizados em clãs discretos e presentes em muitas culturas.",
    "report": [
      "Os Vampiros são criaturas tão variadas quanto a própria noite que os abriga. Alguns são quase indistinguíveis dos humanos, com uma aparência que mistura charme e elegância, capazes de se misturar à sociedade sem levantar suspeitas. Outros, no entanto, são verdadeiras visões de terror, com rostos pálidos e afundados, olhos brilhantes como brasas e presas que parecem feitas para rasgar carne e alma. Independentemente de sua aparência, todos os Vampiros compartilham uma característica comum: a sede insaciável por sangue, o líquido vital que os mantém vivos e poderosos.",
      "Vivendo em clãs secretos, os Vampiros são mestres da discrição. Em um mundo cheio de preconceitos e medo, eles aprenderam a esconder sua verdadeira natureza, muitas vezes se passando por humanos comuns enquanto caçam nas sombras. No entanto, por trás dessa fachada de normalidade, há feras sanguinárias, predadores que veem os vivos não como iguais, mas como presas. A noite é seu domínio, e aqueles que ousam desafiar suas regras logo descobrem que a escuridão pode ser mortal.",
      "Os Vampiros são uma das espécies mais comuns do mundo sobrenatural, presentes em quase todas as culturas e regiões. Alguns indivíduos famosos têm milhares de anos, testemunhas vivas de eras passadas que carregam consigo segredos e histórias que poucos podem imaginar. No entanto, a origem dos Vampiros permanece um mistério. Muitos acreditam que a maldição vampírica começou com o primeiro assassinato, quando Caim matou Abel e foi amaldiçoado a vagar pela Terra como um predador eterno. Se essa lenda é verdadeira ou não, ninguém pode dizer com certeza, mas uma coisa é clara: os Vampiros são uma maldição viva, uma lembrança de que o sangue derramado nunca é esquecido.",
      "A rivalidade entre Vampiros e Lobisomens é lendária, uma guerra que parece não ter fim. Enquanto os Vampiros são criaturas de astúcia e poder, os Lobisomens são a personificação da força bruta e da natureza selvagem. Essa batalha eterna é travada nas sombras, longe dos olhos dos humanos, mas seus efeitos são sentidos em todo o mundo sobrenatural.",
      "Os Vampiros possuem grandes poderes, desde a capacidade de se transformar em morcegos ou névoa até a habilidade de hipnotizar e controlar mentes. No entanto, esses poderes têm um preço: o consumo constante de sangue. Sem ele, os Vampiros enfraquecem, perdendo suas habilidades e, eventualmente, sucumbindo à fome que os consome por dentro. O sangue não é apenas seu sustento; é sua maldição e sua salvação.",
      "Os Vampiros são mais do que criaturas da noite; eles são um lembrete de que a eternidade tem um preço, e que, às vezes, o poder pode ser tanto uma bênção quanto uma maldição. E, enquanto houver sangue para alimentar sua sede, eles continuarão a vagar, senhores da noite em um mundo que nunca estará completamente seguro."
    ],
    "quote": "A eternidade é uma maldição doce, e o sangue... é o preço que pagamos por ela. Mas quem pode resistir à tentação de viver para sempre?",
    "abilities": speciesAbilities["especie-vampiro"],
    "notableMembers": [],
    "facts": [
      "O sangue é indispensável à sua existência.",
      "A rivalidade com Lobisomens é registrada no manual."
    ],
    "hypotheses": [
      "A origem da maldição é associada, em uma lenda, ao assassinato de Abel por Caim."
    ],
    "unknown": [
      "A origem histórica da espécie e a veracidade da lenda de Caim."
    ],
    "related": [
      "especie-lobisomem",
      "especie-mumia"
    ],
    "source": true,
    "sourceSection": "2.20. Vampiro;",
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit"
  },
  {
    "kind": "verbete",
    "access": "Público",
    "status": "Catalogado",
    "date": "2026-10-21",
    "department": "Documentação e Memória",
    "author": "Arquivo GMS · síntese documental",
    "source": true,
    "sourceUrl": "https://docs.google.com/document/d/1TE0Lkf15QSkwPb__VTUvIX-rXlIBIaQSQPhWGbyStgQ/edit",
    "id": "org-gms",
    "code": "ORG-001",
    "title": "A G.M.S.",
    "category": "Organizações",
    "summary": "Uma instituição de alcance global, formada por agentes de todas as espécies, dedicada à convivência e à investigação de crimes.",
    "report": [
      "Em um mundo dividido entre tantas criaturas, a convivência sempre exigiu mais do que a simples vontade de viver em paz. Diferenças de costumes, necessidades e capacidades transformavam pequenos desentendimentos em conflitos que podiam envolver comunidades inteiras. Um crime cometido por um indivíduo podia alimentar o ódio contra toda a sua espécie. Uma disputa entre vizinhos podia atravessar fronteiras e se tornar uma guerra. Foi da necessidade de impedir que esses conflitos destruíssem a vida em comum que surgiram os primeiros antecessores da G.M.S.",
      "Há séculos, grupos de diferentes origens começaram a estabelecer acordos de proteção, mediação e investigação. Reuniam pessoas capazes de circular entre comunidades, compreender suas diferenças e intervir quando uma autoridade isolada já não conseguia alcançar uma solução. Esses primeiros grupos trabalhavam com os recursos de sua época e dependiam da confiança de quem aceitava colaborar. Aos poucos, passaram a compartilhar informações, estabelecer compromissos e construir uma rede que sobreviveria a muitas das sociedades que a viram nascer.",
      "A organização atravessou séculos de mudanças. Teve outros nomes, adotou diferentes estruturas e acompanhou a transformação de aldeias em cidades, de reinos em países e de antigos acordos em instituições cada vez mais complexas. Seus métodos também mudaram com o desenvolvimento da ciência, das leis, dos transportes e das comunicações. A agência conhecida atualmente como G.M.S., Global Monster Security, é o resultado dessa longa evolução. Sua forma atual pertence ao mundo moderno, mas a responsabilidade que carrega foi construída ao longo de gerações.",
      "A G.M.S. é responsável por preservar a harmonia entre todas as criaturas e atuar sobre os conflitos que ameaçam essa convivência. Seu trabalho envolve investigar e solucionar crimes cometidos por indivíduos das mais diversas espécies, proteger pessoas em risco e impedir que a violência se transforme em perseguição coletiva. Para seus agentes, compreender uma ocorrência exige conhecer as pessoas envolvidas, os vestígios deixados e as particularidades de um mundo em que cada criatura pode interagir com a realidade de uma maneira diferente.",
      "Sua presença se estende por todo o globo. A agência reúne agentes de todas as espécies, com experiências, culturas e capacidades que ampliam sua compreensão dos lugares onde atua. Humanos, górgonas, lobisomens, anjos, demônios e tantas outras criaturas podem trabalhar sob o mesmo emblema. Essa diversidade faz parte da própria razão de existir da G.M.S.: uma instituição encarregada de proteger a convivência precisa contar com as vozes de quem participa dela. Ainda assim, dividir uma missão também exige aprender a lidar com diferenças que nenhum treinamento apaga por completo.",
      "Em muitas ocorrências, a G.M.S. trabalha em conjunto com a polícia e outras autoridades locais. Policiais acompanham o cotidiano de suas comunidades, conhecem seus moradores e frequentemente são os primeiros a chegar ao local de um crime. A agência contribui com seus profissionais, sua rede de informações e a experiência necessária para lidar com situações que envolvem particularidades de diferentes espécies ou conexões entre regiões. Investigações conjuntas, troca de informações e operações coordenadas fazem parte dessa relação, assim como as dificuldades de conciliar responsabilidades, procedimentos e opiniões.",
      "A imagem da G.M.S. também desperta admiração. Muitas pessoas crescem ouvindo histórias de agentes que protegeram comunidades, encontraram desaparecidos ou impediram que um conflito atingisse pessoas inocentes. Para elas, ingressar na agência significa ter a oportunidade de fazer algo importante pelo mundo. Outros enxergam uma carreira, a possibilidade de construir uma vida dentro da instituição e o desejo de chegar à aposentadoria depois de muitos anos de serviço. Entre os que procuram uma vaga existem sonhos de pertencimento, estabilidade, reconhecimento e justiça.",
      "A rotina dessa carreira cobra muito de quem a escolhe. Há relatórios, investigações que parecem não avançar, horas de espera e decisões que precisam ser tomadas com informações incompletas. Existem afastamentos da família, noites interrompidas e a responsabilidade de falar com pessoas que acabaram de perder algo que jamais poderão recuperar. O prestígio de um emblema pouco ajuda quando o cansaço se acumula e uma nova ocorrência chega antes que a anterior tenha deixado de pesar.",
      "O perigo acompanha esse trabalho. Agentes enfrentam criminosos capazes de explorar as próprias características de maneiras imprevisíveis, entram em lugares hostis e podem se tornar alvos por causa das investigações que conduzem. Missões deixam feridas, perdas e lembranças difíceis de carregar. Muitos desejam envelhecer dentro da G.M.S. e encerrar sua carreira em segurança; chegar a esse momento exige sobreviver aos riscos de cada operação. A vida na agência está muito distante do glamour que suas histórias mais conhecidas podem sugerir.",
      "Essa admiração convive com críticas e desconfiança. Há pessoas que questionam seus métodos, a extensão de sua influência e as decisões tomadas em nome da harmonia. Algumas acreditam que a agência interfere demais na vida das comunidades; outras consideram que ela deveria agir com mais firmeza. Também existem aqueles que se sentem pouco ouvidos e duvidam de que uma instituição tão ampla consiga tratar todas as criaturas com a mesma atenção. O descontentamento pode partir de cidadãos comuns, comunidades inteiras e pessoas que esperavam uma resposta diferente da organização.",
      "Trabalhar na G.M.S. significa conviver com essas expectativas e contradições. Um agente pode ser recebido como esperança em uma casa e como uma presença indesejada na seguinte. Precisa ouvir, investigar e agir sabendo que suas escolhas terão consequências para quem continua vivendo naquele lugar depois que a operação terminar. A promessa de proteger a harmonia é colocada à prova em cada encontro, especialmente quando a solução mais rápida parece incapaz de oferecer uma resposta justa.",
      "Depois de séculos e tantos nomes, a G.M.S. continua dependendo das pessoas que aceitam carregar essa responsabilidade. São elas que transformam arquivos em investigações, informações em decisões e uma antiga ideia de convivência em trabalho cotidiano. Algumas encontram ali um propósito para toda a vida. Outras descobrem o peso de uma escolha que parecia mais simples vista de longe. Para todas, o mundo que precisa ser protegido permanece vasto, diverso e cheio de conflitos esperando pela próxima resposta.",
      "E você? Está pronto para se tornar um agente da G.M.S.?"
    ],
    "facts": [
      "A agência atua em escala global e reúne agentes de diferentes espécies.",
      "Investiga crimes, protege pessoas e coopera com autoridades locais.",
      "Sua estrutura moderna deriva de redes antigas de mediação."
    ],
    "hypotheses": [],
    "unknown": [
      "Os nomes anteriores e as datas exatas de cada reorganização não são especificados."
    ],
    "related": [
      "especie-humano",
      "especie-gorgona"
    ],
    "sourceSection": "A G.M.S."
  },
  {
    "kind": "investigacao",
    "demo": true,
    "date": "2026-10-21",
    "department": "Arquivo de demonstração",
    "author": "Registro ilustrativo · não canônico",
    "source": false,
    "people": [
      "Nenhuma pessoa identificada — exemplo de registro."
    ],
    "locations": [
      "Local não estabelecido na lore."
    ],
    "facts": [
      "Este é um exemplo de interface, não um acontecimento oficial."
    ],
    "hypotheses": [],
    "unknown": [
      "Dados do caso oficial ainda não incorporados."
    ],
    "id": "caso-001",
    "code": "INV-DEMO-001",
    "title": "Mediação em comunidade costeira",
    "category": "Convivência",
    "access": "Público",
    "status": "Em andamento",
    "summary": "Dossiê ilustrativo para demonstrar vínculos entre uma investigação, o mandato da GMS e o registro de uma espécie.",
    "report": [
      "EXEMPLO NÃO CANÔNICO. Este dossiê demonstra como uma investigação pode reunir informações sobre convivência entre espécies. Não registra um evento da história oficial.",
      "A consulta ao verbete dos Abissais permite compreender necessidades de hidratação e hábitos de comunidades aquáticas. O mandato da GMS orienta a mediação e a proteção de todos os envolvidos."
    ],
    "evidence": [
      "Nenhuma evidência oficial incorporada."
    ],
    "timeline": [
      {
        "date": "ETAPA 01",
        "text": "Abertura ilustrativa do registro."
      },
      {
        "date": "ETAPA 02",
        "text": "Consulta a referências sobre Abissais e convivência."
      }
    ],
    "related": [
      "especie-abissais",
      "org-gms"
    ]
  },
  {
    "kind": "investigacao",
    "demo": true,
    "date": "2026-10-21",
    "department": "Arquivo de demonstração",
    "author": "Registro ilustrativo · não canônico",
    "source": false,
    "people": [
      "Nenhuma pessoa identificada — exemplo de registro."
    ],
    "locations": [
      "Local não estabelecido na lore."
    ],
    "facts": [
      "Este é um exemplo de interface, não um acontecimento oficial."
    ],
    "hypotheses": [],
    "unknown": [
      "Dados do caso oficial ainda não incorporados."
    ],
    "id": "caso-002",
    "code": "INV-DEMO-002",
    "title": "Circulação de material feérico",
    "category": "Proteção",
    "access": "Restrito",
    "status": "Em observação",
    "summary": "Exemplo não canônico de organização de referências sobre a proteção de criaturas mágicas.",
    "report": [
      "EXEMPLO NÃO CANÔNICO. A fonte menciona a perseguição de Fadas por criminosos interessados em sua magia. Este registro apenas demonstra a estrutura de um caso associado a esse tema.",
      "Nenhuma operação, apreensão ou ocorrência concreta é afirmada neste dossiê. Consulte o verbete das Fadas nos arquivos relacionados para acessar o conteúdo narrativo da fonte."
    ],
    "evidence": [
      "Nenhuma evidência oficial incorporada."
    ],
    "timeline": [
      {
        "date": "ETAPA 01",
        "text": "Reunião de referências para consulta."
      }
    ],
    "related": [
      "especie-fada",
      "org-gms"
    ]
  },
  {
    "kind": "investigacao",
    "demo": true,
    "date": "2026-10-21",
    "department": "Arquivo de demonstração",
    "author": "Registro ilustrativo · não canônico",
    "source": false,
    "people": [
      "Nenhuma pessoa identificada — exemplo de registro."
    ],
    "locations": [
      "Local não estabelecido na lore."
    ],
    "facts": [
      "Este é um exemplo de interface, não um acontecimento oficial."
    ],
    "hypotheses": [],
    "unknown": [
      "Dados do caso oficial ainda não incorporados."
    ],
    "id": "caso-003",
    "code": "INV-DEMO-003",
    "title": "Preservação de testemunho",
    "category": "Documentação",
    "access": "Censurado",
    "status": "Encerrado",
    "summary": "Modelo de dossiê com partes censuradas. Não corresponde a uma investigação da lore.",
    "report": [
      "EXEMPLO NÃO CANÔNICO. Este registro demonstra a aparência de um arquivo parcialmente censurado.",
      "Identificação da testemunha: ████████████. Local: ████████. Nenhum depoimento fictício foi atribuído a uma pessoa da história oficial."
    ],
    "evidence": [
      "Nenhum depoimento incorporado."
    ],
    "timeline": [
      {
        "date": "MODELO",
        "text": "Registro encerrado apenas para demonstrar o filtro de situação."
      }
    ],
    "related": [
      "org-gms"
    ]
  },
  ...agentRecords,
  ...operationalRecords,
  ...reservedRecords
];
