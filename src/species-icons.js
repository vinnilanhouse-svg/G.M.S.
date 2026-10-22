// Símbolos originais presentes nos cabeçalhos das espécies do manual, edição 1.7.
// O símbolo de Carne representa a entrada geral de Constructos no catálogo.
export const speciesIcons = {
  "especie-abissais": {
    "src": "/species-icons/especie-abissais.webp",
    "width": 128,
    "height": 128
  },
  "especie-anjo": {
    "src": "/species-icons/especie-anjo.webp",
    "width": 128,
    "height": 128
  },
  "especie-caipora": {
    "src": "/species-icons/especie-caipora.webp",
    "width": 128,
    "height": 128
  },
  "especie-capelobo": {
    "src": "/species-icons/especie-capelobo.webp",
    "width": 128,
    "height": 128
  },
  "especie-centauro": {
    "src": "/species-icons/especie-centauro.webp",
    "width": 128,
    "height": 128
  },
  "especie-constructo": {
    "src": "/species-icons/especie-constructo.webp",
    "width": 128,
    "height": 128
  },
  "especie-corpo-seco": {
    "src": "/species-icons/especie-corpo-seco.webp",
    "width": 128,
    "height": 128
  },
  "especie-curupira": {
    "src": "/species-icons/especie-curupira.webp",
    "width": 128,
    "height": 128
  },
  "especie-demonio": {
    "src": "/species-icons/especie-demonio.webp",
    "width": 128,
    "height": 128
  },
  "especie-fada": {
    "src": "/species-icons/especie-fada.webp",
    "width": 128,
    "height": 128
  },
  "especie-gorgona": {
    "src": "/species-icons/especie-gorgona.webp",
    "width": 128,
    "height": 128
  },
  "especie-humano": {
    "src": "/species-icons/especie-humano.webp",
    "width": 128,
    "height": 128
  },
  "especie-leprechaun": {
    "src": "/species-icons/especie-leprechaun.webp",
    "width": 128,
    "height": 128
  },
  "especie-lobisomem": {
    "src": "/species-icons/especie-lobisomem.webp",
    "width": 128,
    "height": 128
  },
  "especie-mumia": {
    "src": "/species-icons/especie-mumia.webp",
    "width": 128,
    "height": 128
  },
  "especie-ogro": {
    "src": "/species-icons/especie-ogro.webp",
    "width": 128,
    "height": 128
  },
  "especie-poltergeist": {
    "src": "/species-icons/especie-poltergeist.webp",
    "width": 128,
    "height": 128
  },
  "especie-saci": {
    "src": "/species-icons/especie-saci.webp",
    "width": 128,
    "height": 128
  },
  "especie-salamandra": {
    "src": "/species-icons/especie-salamandra.webp",
    "width": 128,
    "height": 128
  },
  "especie-vampiro": {
    "src": "/species-icons/especie-vampiro.webp",
    "width": 128,
    "height": 128
  }
};

// Os três símbolos do cabeçalho de Constructos, conforme o material da ficha.
export const constructIcons = {
  carne: {
    ...speciesIcons['especie-constructo'],
    alt: 'Constructo de Carne',
  },
  metal: {
    src: '/species-icons/constructo-metal.webp',
    width: 128,
    height: 128,
    alt: 'Constructo de Metal',
  },
  barro: {
    src: '/species-icons/constructo-barro.webp',
    width: 128,
    height: 128,
    alt: 'Constructo de Barro',
  },
};
