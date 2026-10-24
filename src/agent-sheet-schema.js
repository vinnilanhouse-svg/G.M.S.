// Gerado a partir dos campos AcroForm do PDF fornecido. Regeneração: scripts/extract-agent-sheet.py.
export const agentSheetSource = {
  "sourceFilename": "Ficha_Monstrao_Automatica_Editavel.pdf",
  "sha256": "b48097e6df7681aa7be0e93ab40e4bcf062b5b4aa4efa3028256a07fcbfd7359",
  "pageCount": 3,
  "abilityRows": 11,
  "attackRows": 11,
  "inventoryRows": 26
};

export const agentSheetFields = {
  "nome": {
    "label": "Nome da Criatura",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "jogador": {
    "label": "Jogador",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "especie": {
    "label": "Espécie",
    "defaultValue": "-",
    "readOnly": false,
    "type": "choice",
    "options": [
      "Abissais",
      "Anjo",
      "Caipora",
      "Capelobo",
      "Centauro",
      "Constructo de Carne",
      "Constructo de Metal",
      "Constructo de Barro",
      "Corpo Seco e Bradador",
      "Curupira",
      "Demônio",
      "Fada",
      "Gorgona",
      "Humano",
      "Leprechaun",
      "Lobisomen",
      "Mumia",
      "Ogro",
      "Poltergeist",
      "Saci",
      "Salamandra",
      "Vampiro",
      "-"
    ]
  },
  "especialidade": {
    "label": "Especialidade",
    "defaultValue": "-",
    "readOnly": false,
    "type": "choice",
    "options": [
      "-",
      "Alquimista",
      "Artista",
      "Criminoso",
      "Cozinheiro",
      "Investigador",
      "Artes Marciais",
      "Atirador de Elite",
      "Esgrimista",
      "Cavaleiro",
      "Mestre das Sombras"
    ]
  },
  "nivel": {
    "label": "Nível",
    "defaultValue": "1",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 1,
      "max": 20,
      "integer": true,
      "allowBlank": false
    }
  },
  "genero": {
    "label": "Gênero",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "idade": {
    "label": "Idade",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "altura": {
    "label": "Altura",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "olhos": {
    "label": "Olhos",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "cabelos": {
    "label": "Cabelos",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "grupo": {
    "label": "Grupo Afiliado",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "cargo": {
    "label": "Cargo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "pe_atual": {
    "label": "P.E. Atual",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "pe_proximo": {
    "label": "P.E. Próximo",
    "defaultValue": "0",
    "readOnly": true,
    "type": "text"
  },
  "vida_atual": {
    "label": "Pontos de Vida - Atual",
    "defaultValue": "25",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "vida_max": {
    "label": "Pontos de Vida - Máximo",
    "defaultValue": "25",
    "readOnly": true,
    "type": "text"
  },
  "recurso_nome": {
    "label": "recurso_nome",
    "defaultValue": "Pontos de Essência",
    "readOnly": true,
    "type": "text"
  },
  "essencia_atual": {
    "label": "Pontos de Essência - Atual",
    "defaultValue": "5",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "essencia_max": {
    "label": "Pontos de Essência - Máximo",
    "defaultValue": "5",
    "readOnly": true,
    "type": "text"
  },
  "attr_corpo": {
    "label": "Corpo (0 a 20)",
    "defaultValue": "2",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": 20,
      "integer": false,
      "allowBlank": true
    }
  },
  "attr_agilidade": {
    "label": "Agilidade (0 a 20)",
    "defaultValue": "2",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": 20,
      "integer": false,
      "allowBlank": true
    }
  },
  "attr_mente": {
    "label": "Mente (0 a 20)",
    "defaultValue": "2",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": 20,
      "integer": false,
      "allowBlank": true
    }
  },
  "attr_coracao": {
    "label": "Coração (0 a 20)",
    "defaultValue": "2",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": 20,
      "integer": false,
      "allowBlank": true
    }
  },
  "attr_alma": {
    "label": "Alma (0 a 20)",
    "defaultValue": "2",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": 20,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b19_base": {
    "label": "Acrobacia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b19_bonus": {
    "label": "Acrobacia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b19_total": {
    "label": "Acrobacia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b20_base": {
    "label": "*Alquimia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b20_bonus": {
    "label": "*Alquimia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b20_total": {
    "label": "*Alquimia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b21_base": {
    "label": "Atletismo - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b21_bonus": {
    "label": "Atletismo - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b21_total": {
    "label": "Atletismo - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b22_base": {
    "label": "Atualidades - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b22_bonus": {
    "label": "Atualidades - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b22_total": {
    "label": "Atualidades - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b23_base": {
    "label": "Conhecimento - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b23_bonus": {
    "label": "Conhecimento - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b23_total": {
    "label": "Conhecimento - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b24_base": {
    "label": "*Criptozoologia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b24_bonus": {
    "label": "*Criptozoologia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b24_total": {
    "label": "*Criptozoologia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b25_base": {
    "label": "Diplomacia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b25_bonus": {
    "label": "Diplomacia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b25_total": {
    "label": "Diplomacia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b26_base": {
    "label": "*Dirigir - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b26_bonus": {
    "label": "*Dirigir - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b26_total": {
    "label": "*Dirigir - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b27_base": {
    "label": "Enganação - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b27_bonus": {
    "label": "Enganação - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b27_total": {
    "label": "Enganação - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b28_base": {
    "label": "Furtar - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b28_bonus": {
    "label": "Furtar - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b28_total": {
    "label": "Furtar - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b29_base": {
    "label": "Furtividade - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b29_bonus": {
    "label": "Furtividade - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b29_total": {
    "label": "Furtividade - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b30_base": {
    "label": "*Historia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b30_bonus": {
    "label": "*Historia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b30_total": {
    "label": "*Historia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b31_base": {
    "label": "Intimidação - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b31_bonus": {
    "label": "Intimidação - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b31_total": {
    "label": "Intimidação - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b32_base": {
    "label": "Intuição - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_b32_bonus": {
    "label": "Intuição - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_b32_total": {
    "label": "Intuição - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g19_base": {
    "label": "Investigação - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g19_bonus": {
    "label": "Investigação - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g19_total": {
    "label": "Investigação - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g20_base": {
    "label": "Luta - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g20_bonus": {
    "label": "Luta - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g20_total": {
    "label": "Luta - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g21_base": {
    "label": "*Magia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g21_bonus": {
    "label": "*Magia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g21_total": {
    "label": "*Magia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g22_base": {
    "label": "Medicina - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g22_bonus": {
    "label": "Medicina - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g22_total": {
    "label": "Medicina - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g23_base": {
    "label": "Percepção - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g23_bonus": {
    "label": "Percepção - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g23_total": {
    "label": "Percepção - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g24_base": {
    "label": "*Performace - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g24_bonus": {
    "label": "*Performace - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g24_total": {
    "label": "*Performace - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g25_base": {
    "label": "Persuasão - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g25_bonus": {
    "label": "Persuasão - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g25_total": {
    "label": "Persuasão - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g26_base": {
    "label": "*Pontaria - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g26_bonus": {
    "label": "*Pontaria - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g26_total": {
    "label": "*Pontaria - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g27_base": {
    "label": "*Religião - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g27_bonus": {
    "label": "*Religião - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g27_total": {
    "label": "*Religião - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g28_base": {
    "label": "Sedução - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g28_bonus": {
    "label": "Sedução - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g28_total": {
    "label": "Sedução - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g29_base": {
    "label": "*Sobrevivencia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g29_bonus": {
    "label": "*Sobrevivencia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g29_total": {
    "label": "*Sobrevivencia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g30_base": {
    "label": "Sorte - Base",
    "defaultValue": "10",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g30_bonus": {
    "label": "Sorte - Bônus",
    "defaultValue": "0",
    "readOnly": true,
    "type": "text"
  },
  "per_g30_total": {
    "label": "Sorte - Total",
    "defaultValue": "10",
    "readOnly": true,
    "type": "text"
  },
  "per_g31_base": {
    "label": "*Tecnologia - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g31_bonus": {
    "label": "*Tecnologia - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g31_total": {
    "label": "*Tecnologia - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g32_base": {
    "label": "Vontade - Base",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "per_g32_bonus": {
    "label": "Vontade - Bônus",
    "defaultValue": "0",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": null,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "per_g32_total": {
    "label": "Vontade - Total",
    "defaultValue": "2",
    "readOnly": true,
    "type": "text"
  },
  "habilidade_1_nome": {
    "label": "Habilidade 1 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_1_descricao": {
    "label": "Habilidade 1 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_1_acao": {
    "label": "Habilidade 1 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_1_custo": {
    "label": "Habilidade 1 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_2_nome": {
    "label": "Habilidade 2 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_2_descricao": {
    "label": "Habilidade 2 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_2_acao": {
    "label": "Habilidade 2 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_2_custo": {
    "label": "Habilidade 2 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_3_nome": {
    "label": "Habilidade 3 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_3_descricao": {
    "label": "Habilidade 3 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_3_acao": {
    "label": "Habilidade 3 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_3_custo": {
    "label": "Habilidade 3 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_4_nome": {
    "label": "Habilidade 4 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_4_descricao": {
    "label": "Habilidade 4 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_4_acao": {
    "label": "Habilidade 4 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_4_custo": {
    "label": "Habilidade 4 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_5_nome": {
    "label": "Habilidade 5 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_5_descricao": {
    "label": "Habilidade 5 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_5_acao": {
    "label": "Habilidade 5 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_5_custo": {
    "label": "Habilidade 5 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_6_nome": {
    "label": "Habilidade 6 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_6_descricao": {
    "label": "Habilidade 6 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_6_acao": {
    "label": "Habilidade 6 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_6_custo": {
    "label": "Habilidade 6 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_7_nome": {
    "label": "Habilidade 7 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_7_descricao": {
    "label": "Habilidade 7 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_7_acao": {
    "label": "Habilidade 7 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_7_custo": {
    "label": "Habilidade 7 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_8_nome": {
    "label": "Habilidade 8 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_8_descricao": {
    "label": "Habilidade 8 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_8_acao": {
    "label": "Habilidade 8 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_8_custo": {
    "label": "Habilidade 8 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_9_nome": {
    "label": "Habilidade 9 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_9_descricao": {
    "label": "Habilidade 9 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_9_acao": {
    "label": "Habilidade 9 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_9_custo": {
    "label": "Habilidade 9 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_10_nome": {
    "label": "Habilidade 10 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_10_descricao": {
    "label": "Habilidade 10 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_10_acao": {
    "label": "Habilidade 10 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_10_custo": {
    "label": "Habilidade 10 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_11_nome": {
    "label": "Habilidade 11 - Nome",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_11_descricao": {
    "label": "Habilidade 11 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_11_acao": {
    "label": "Habilidade 11 - Ação",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "habilidade_11_custo": {
    "label": "Habilidade 11 - Custo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "ataque_1_nome": {
    "label": "Ataque 1 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_1_dano": {
    "label": "Ataque 1 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_1_atributo": {
    "label": "Ataque 1 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_1_tipo": {
    "label": "Ataque 1 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_2_nome": {
    "label": "Ataque 2 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_2_dano": {
    "label": "Ataque 2 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_2_atributo": {
    "label": "Ataque 2 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_2_tipo": {
    "label": "Ataque 2 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_3_nome": {
    "label": "Ataque 3 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_3_dano": {
    "label": "Ataque 3 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_3_atributo": {
    "label": "Ataque 3 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_3_tipo": {
    "label": "Ataque 3 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_4_nome": {
    "label": "Ataque 4 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_4_dano": {
    "label": "Ataque 4 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_4_atributo": {
    "label": "Ataque 4 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_4_tipo": {
    "label": "Ataque 4 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_5_nome": {
    "label": "Ataque 5 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_5_dano": {
    "label": "Ataque 5 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_5_atributo": {
    "label": "Ataque 5 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_5_tipo": {
    "label": "Ataque 5 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_6_nome": {
    "label": "Ataque 6 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_6_dano": {
    "label": "Ataque 6 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_6_atributo": {
    "label": "Ataque 6 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_6_tipo": {
    "label": "Ataque 6 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_7_nome": {
    "label": "Ataque 7 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_7_dano": {
    "label": "Ataque 7 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_7_atributo": {
    "label": "Ataque 7 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_7_tipo": {
    "label": "Ataque 7 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_8_nome": {
    "label": "Ataque 8 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_8_dano": {
    "label": "Ataque 8 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_8_atributo": {
    "label": "Ataque 8 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_8_tipo": {
    "label": "Ataque 8 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_9_nome": {
    "label": "Ataque 9 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_9_dano": {
    "label": "Ataque 9 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_9_atributo": {
    "label": "Ataque 9 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_9_tipo": {
    "label": "Ataque 9 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_10_nome": {
    "label": "Ataque 10 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_10_dano": {
    "label": "Ataque 10 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_10_atributo": {
    "label": "Ataque 10 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_10_tipo": {
    "label": "Ataque 10 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_11_nome": {
    "label": "Ataque 11 - Ataque",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_11_dano": {
    "label": "Ataque 11 - Dano",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_11_atributo": {
    "label": "Ataque 11 - Atributo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "ataque_11_tipo": {
    "label": "Ataque 11 - Tipo",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "peso_max": {
    "label": "Peso Máximo = Corpo x 2",
    "defaultValue": "4",
    "readOnly": true,
    "type": "text"
  },
  "peso_total": {
    "label": "Soma dos pesos do Inventário",
    "defaultValue": "0",
    "readOnly": true,
    "type": "text"
  },
  "item_1_nome": {
    "label": "Item 1 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_1_descricao": {
    "label": "Item 1 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_1_peso": {
    "label": "Item 1 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_2_nome": {
    "label": "Item 2 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_2_descricao": {
    "label": "Item 2 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_2_peso": {
    "label": "Item 2 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_3_nome": {
    "label": "Item 3 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_3_descricao": {
    "label": "Item 3 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_3_peso": {
    "label": "Item 3 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_4_nome": {
    "label": "Item 4 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_4_descricao": {
    "label": "Item 4 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_4_peso": {
    "label": "Item 4 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_5_nome": {
    "label": "Item 5 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_5_descricao": {
    "label": "Item 5 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_5_peso": {
    "label": "Item 5 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_6_nome": {
    "label": "Item 6 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_6_descricao": {
    "label": "Item 6 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_6_peso": {
    "label": "Item 6 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_7_nome": {
    "label": "Item 7 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_7_descricao": {
    "label": "Item 7 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_7_peso": {
    "label": "Item 7 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_8_nome": {
    "label": "Item 8 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_8_descricao": {
    "label": "Item 8 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_8_peso": {
    "label": "Item 8 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_9_nome": {
    "label": "Item 9 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_9_descricao": {
    "label": "Item 9 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_9_peso": {
    "label": "Item 9 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_10_nome": {
    "label": "Item 10 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_10_descricao": {
    "label": "Item 10 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_10_peso": {
    "label": "Item 10 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_11_nome": {
    "label": "Item 11 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_11_descricao": {
    "label": "Item 11 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_11_peso": {
    "label": "Item 11 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_12_nome": {
    "label": "Item 12 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_12_descricao": {
    "label": "Item 12 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_12_peso": {
    "label": "Item 12 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_13_nome": {
    "label": "Item 13 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_13_descricao": {
    "label": "Item 13 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_13_peso": {
    "label": "Item 13 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_14_nome": {
    "label": "Item 14 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_14_descricao": {
    "label": "Item 14 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_14_peso": {
    "label": "Item 14 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_15_nome": {
    "label": "Item 15 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_15_descricao": {
    "label": "Item 15 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_15_peso": {
    "label": "Item 15 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_16_nome": {
    "label": "Item 16 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_16_descricao": {
    "label": "Item 16 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_16_peso": {
    "label": "Item 16 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_17_nome": {
    "label": "Item 17 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_17_descricao": {
    "label": "Item 17 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_17_peso": {
    "label": "Item 17 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_18_nome": {
    "label": "Item 18 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_18_descricao": {
    "label": "Item 18 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_18_peso": {
    "label": "Item 18 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_19_nome": {
    "label": "Item 19 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_19_descricao": {
    "label": "Item 19 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_19_peso": {
    "label": "Item 19 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_20_nome": {
    "label": "Item 20 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_20_descricao": {
    "label": "Item 20 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_20_peso": {
    "label": "Item 20 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_21_nome": {
    "label": "Item 21 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_21_descricao": {
    "label": "Item 21 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_21_peso": {
    "label": "Item 21 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_22_nome": {
    "label": "Item 22 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_22_descricao": {
    "label": "Item 22 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_22_peso": {
    "label": "Item 22 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_23_nome": {
    "label": "Item 23 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_23_descricao": {
    "label": "Item 23 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_23_peso": {
    "label": "Item 23 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_24_nome": {
    "label": "Item 24 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_24_descricao": {
    "label": "Item 24 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_24_peso": {
    "label": "Item 24 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_25_nome": {
    "label": "Item 25 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_25_descricao": {
    "label": "Item 25 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_25_peso": {
    "label": "Item 25 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "item_26_nome": {
    "label": "Item 26 - Item",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_26_descricao": {
    "label": "Item 26 - Descrição",
    "defaultValue": "",
    "readOnly": false,
    "type": "text"
  },
  "item_26_peso": {
    "label": "Item 26 - Peso",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "numeric": {
      "min": 0,
      "max": null,
      "integer": false,
      "allowBlank": true
    }
  },
  "historia": {
    "label": "História do Personagem",
    "defaultValue": "",
    "readOnly": false,
    "type": "text",
    "multiline": true
  },
  "_atualizar_visuais": {
    "label": "_atualizar_visuais",
    "defaultValue": "",
    "readOnly": true,
    "type": "text"
  },
  "grafico_corpo": {
    "label": "Régua de corpo",
    "defaultValue": "2",
    "readOnly": true,
    "type": "graphic"
  },
  "grafico_agilidade": {
    "label": "Régua de agilidade",
    "defaultValue": "2",
    "readOnly": true,
    "type": "graphic"
  },
  "grafico_mente": {
    "label": "Régua de mente",
    "defaultValue": "2",
    "readOnly": true,
    "type": "graphic"
  },
  "grafico_coracao": {
    "label": "Régua de coracao",
    "defaultValue": "2",
    "readOnly": true,
    "type": "graphic"
  },
  "grafico_alma": {
    "label": "Régua de alma",
    "defaultValue": "2",
    "readOnly": true,
    "type": "graphic"
  },
  "grafico_vida": {
    "label": "Barra de Vida",
    "defaultValue": "v15",
    "readOnly": true,
    "type": "graphic"
  },
  "grafico_essencia": {
    "label": "Barra de Essência ou Energia",
    "defaultValue": "e16",
    "readOnly": true,
    "type": "graphic"
  },
  "icone_especie": {
    "label": "Ícone da Espécie selecionada",
    "defaultValue": "empty",
    "readOnly": true,
    "type": "graphic"
  }
};

export const agentSheetSkills = [
  {
    "id": "per_b19",
    "label": "Acrobacia",
    "attribute": "attr_agilidade"
  },
  {
    "id": "per_b20",
    "label": "*Alquimia",
    "attribute": "attr_alma"
  },
  {
    "id": "per_b21",
    "label": "Atletismo",
    "attribute": "attr_corpo"
  },
  {
    "id": "per_b22",
    "label": "Atualidades",
    "attribute": "attr_mente"
  },
  {
    "id": "per_b23",
    "label": "Conhecimento",
    "attribute": "attr_mente"
  },
  {
    "id": "per_b24",
    "label": "*Criptozoologia",
    "attribute": "attr_mente"
  },
  {
    "id": "per_b25",
    "label": "Diplomacia",
    "attribute": "attr_coracao"
  },
  {
    "id": "per_b26",
    "label": "*Dirigir",
    "attribute": "attr_agilidade"
  },
  {
    "id": "per_b27",
    "label": "Enganação",
    "attribute": "attr_coracao"
  },
  {
    "id": "per_b28",
    "label": "Furtar",
    "attribute": "attr_agilidade"
  },
  {
    "id": "per_b29",
    "label": "Furtividade",
    "attribute": "attr_agilidade"
  },
  {
    "id": "per_b30",
    "label": "*Historia",
    "attribute": "attr_mente"
  },
  {
    "id": "per_b31",
    "label": "Intimidação",
    "attribute": "attr_coracao"
  },
  {
    "id": "per_b32",
    "label": "Intuição",
    "attribute": "attr_alma"
  },
  {
    "id": "per_g19",
    "label": "Investigação",
    "attribute": "attr_mente"
  },
  {
    "id": "per_g20",
    "label": "Luta",
    "attribute": "attr_corpo"
  },
  {
    "id": "per_g21",
    "label": "*Magia",
    "attribute": "attr_alma"
  },
  {
    "id": "per_g22",
    "label": "Medicina",
    "attribute": "attr_mente"
  },
  {
    "id": "per_g23",
    "label": "Percepção",
    "attribute": "attr_mente"
  },
  {
    "id": "per_g24",
    "label": "*Performace",
    "attribute": "attr_coracao"
  },
  {
    "id": "per_g25",
    "label": "Persuasão",
    "attribute": "attr_coracao"
  },
  {
    "id": "per_g26",
    "label": "*Pontaria",
    "attribute": "attr_agilidade"
  },
  {
    "id": "per_g27",
    "label": "*Religião",
    "attribute": "attr_mente"
  },
  {
    "id": "per_g28",
    "label": "Sedução",
    "attribute": "attr_coracao"
  },
  {
    "id": "per_g29",
    "label": "*Sobrevivencia",
    "attribute": "attr_mente"
  },
  {
    "id": "per_g30",
    "label": "Sorte",
    "attribute": null
  },
  {
    "id": "per_g31",
    "label": "*Tecnologia",
    "attribute": "attr_mente"
  },
  {
    "id": "per_g32",
    "label": "Vontade",
    "attribute": "attr_alma"
  }
];
