// Gerado automaticamente via parsing dos arquivos CSV do TSE
export interface CityData2022 {
    name: string;
    votes: number;
    zones: number;
    sections: number;
    locais: number;
    percentual: number;
}

export interface CityData2018 {
    name: string;
    votes: number;
    zones: number;
    sections: number;
}

export interface CityComparison {
    name: string;
    votes2018: number;
    votes2022: number;
    pct2018: number;
    pct2022: number;
    variacao: number;
    varPct: number;
}

export const ADELMO_CITIES_2022: CityData2022[] = [
    {
        "name": "CAXIAS",
        "votes": 8978,
        "zones": 1,
        "sections": 361,
        "locais": 117,
        "percentual": 26.13
    },
    {
        "name": "ROSÁRIO",
        "votes": 3134,
        "zones": 1,
        "sections": 103,
        "locais": 36,
        "percentual": 9.12
    },
    {
        "name": "ALDEIAS ALTAS",
        "votes": 2273,
        "zones": 1,
        "sections": 68,
        "locais": 16,
        "percentual": 6.61
    },
    {
        "name": "AFONSO CUNHA",
        "votes": 2219,
        "zones": 1,
        "sections": 25,
        "locais": 9,
        "percentual": 6.46
    },
    {
        "name": "ESPERANTINÓPOLIS",
        "votes": 2070,
        "zones": 1,
        "sections": 54,
        "locais": 31,
        "percentual": 6.02
    },
    {
        "name": "SÃO LUÍS",
        "votes": 2069,
        "zones": 6,
        "sections": 646,
        "locais": 135,
        "percentual": 6.02
    },
    {
        "name": "JOSELÂNDIA",
        "votes": 978,
        "zones": 1,
        "sections": 37,
        "locais": 16,
        "percentual": 2.85
    },
    {
        "name": "MAGALHÃES DE ALMEIDA",
        "votes": 967,
        "zones": 1,
        "sections": 48,
        "locais": 19,
        "percentual": 2.81
    },
    {
        "name": "DUQUE BACELAR",
        "votes": 833,
        "zones": 1,
        "sections": 36,
        "locais": 14,
        "percentual": 2.42
    },
    {
        "name": "PARAIBANO",
        "votes": 726,
        "zones": 1,
        "sections": 43,
        "locais": 11,
        "percentual": 2.11
    },
    {
        "name": "CANTANHEDE",
        "votes": 662,
        "zones": 1,
        "sections": 47,
        "locais": 16,
        "percentual": 1.93
    },
    {
        "name": "FORTUNA",
        "votes": 658,
        "zones": 1,
        "sections": 41,
        "locais": 20,
        "percentual": 1.91
    },
    {
        "name": "RAPOSA",
        "votes": 642,
        "zones": 1,
        "sections": 70,
        "locais": 13,
        "percentual": 1.87
    },
    {
        "name": "SÃO JOÃO DO SOTER",
        "votes": 640,
        "zones": 1,
        "sections": 46,
        "locais": 13,
        "percentual": 1.86
    },
    {
        "name": "ARAIOSES",
        "votes": 445,
        "zones": 1,
        "sections": 82,
        "locais": 41,
        "percentual": 1.29
    },
    {
        "name": "CODÓ",
        "votes": 405,
        "zones": 1,
        "sections": 173,
        "locais": 52,
        "percentual": 1.18
    },
    {
        "name": "SÃO JOSÉ DE RIBAMAR",
        "votes": 357,
        "zones": 1,
        "sections": 181,
        "locais": 75,
        "percentual": 1.04
    },
    {
        "name": "PAÇO DO LUMIAR",
        "votes": 355,
        "zones": 1,
        "sections": 158,
        "locais": 39,
        "percentual": 1.03
    },
    {
        "name": "COLINAS",
        "votes": 293,
        "zones": 1,
        "sections": 79,
        "locais": 19,
        "percentual": 0.85
    },
    {
        "name": "PARNARAMA",
        "votes": 292,
        "zones": 1,
        "sections": 72,
        "locais": 27,
        "percentual": 0.85
    },
    {
        "name": "COELHO NETO",
        "votes": 272,
        "zones": 1,
        "sections": 91,
        "locais": 28,
        "percentual": 0.79
    },
    {
        "name": "SÃO RAIMUNDO DAS MANGABEIRAS",
        "votes": 267,
        "zones": 1,
        "sections": 47,
        "locais": 12,
        "percentual": 0.78
    },
    {
        "name": "PASTOS BONS",
        "votes": 264,
        "zones": 1,
        "sections": 37,
        "locais": 14,
        "percentual": 0.77
    },
    {
        "name": "MIRADOR",
        "votes": 217,
        "zones": 1,
        "sections": 42,
        "locais": 10,
        "percentual": 0.63
    },
    {
        "name": "VARGEM GRANDE",
        "votes": 176,
        "zones": 1,
        "sections": 66,
        "locais": 25,
        "percentual": 0.51
    },
    {
        "name": "BREJO",
        "votes": 142,
        "zones": 1,
        "sections": 56,
        "locais": 30,
        "percentual": 0.41
    },
    {
        "name": "SAMBAÍBA",
        "votes": 139,
        "zones": 1,
        "sections": 18,
        "locais": 7,
        "percentual": 0.4
    },
    {
        "name": "JATOBÁ",
        "votes": 128,
        "zones": 1,
        "sections": 13,
        "locais": 7,
        "percentual": 0.37
    },
    {
        "name": "CHAPADINHA",
        "votes": 117,
        "zones": 1,
        "sections": 50,
        "locais": 29,
        "percentual": 0.34
    },
    {
        "name": "GOVERNADOR EUGÊNIO BARROS",
        "votes": 114,
        "zones": 1,
        "sections": 30,
        "locais": 18,
        "percentual": 0.33
    },
    {
        "name": "SÃO BERNARDO",
        "votes": 106,
        "zones": 1,
        "sections": 48,
        "locais": 22,
        "percentual": 0.31
    },
    {
        "name": "POÇÃO DE PEDRAS",
        "votes": 102,
        "zones": 1,
        "sections": 36,
        "locais": 23,
        "percentual": 0.3
    },
    {
        "name": "IMPERATRIZ",
        "votes": 101,
        "zones": 2,
        "sections": 87,
        "locais": 48,
        "percentual": 0.29
    },
    {
        "name": "GONÇALVES DIAS",
        "votes": 99,
        "zones": 1,
        "sections": 25,
        "locais": 11,
        "percentual": 0.29
    },
    {
        "name": "ITAPECURU MIRIM",
        "votes": 97,
        "zones": 1,
        "sections": 68,
        "locais": 36,
        "percentual": 0.28
    },
    {
        "name": "GRAJAÚ",
        "votes": 95,
        "zones": 1,
        "sections": 54,
        "locais": 28,
        "percentual": 0.28
    },
    {
        "name": "TIMON",
        "votes": 93,
        "zones": 1,
        "sections": 79,
        "locais": 34,
        "percentual": 0.27
    },
    {
        "name": "SENADOR ALEXANDRE COSTA",
        "votes": 91,
        "zones": 1,
        "sections": 24,
        "locais": 11,
        "percentual": 0.26
    },
    {
        "name": "ICATU",
        "votes": 82,
        "zones": 1,
        "sections": 32,
        "locais": 19,
        "percentual": 0.24
    },
    {
        "name": "SÃO JOÃO DOS PATOS",
        "votes": 82,
        "zones": 1,
        "sections": 47,
        "locais": 16,
        "percentual": 0.24
    },
    {
        "name": "COROATÁ",
        "votes": 66,
        "zones": 1,
        "sections": 54,
        "locais": 25,
        "percentual": 0.19
    },
    {
        "name": "BACABAL",
        "votes": 65,
        "zones": 1,
        "sections": 49,
        "locais": 29,
        "percentual": 0.19
    },
    {
        "name": "PORTO RICO DO MARANHÃO",
        "votes": 64,
        "zones": 1,
        "sections": 19,
        "locais": 9,
        "percentual": 0.19
    },
    {
        "name": "PRESIDENTE DUTRA",
        "votes": 57,
        "zones": 1,
        "sections": 41,
        "locais": 15,
        "percentual": 0.17
    },
    {
        "name": "NOVA IORQUE",
        "votes": 57,
        "zones": 1,
        "sections": 13,
        "locais": 5,
        "percentual": 0.17
    },
    {
        "name": "BARÃO DE GRAJAÚ",
        "votes": 53,
        "zones": 1,
        "sections": 23,
        "locais": 11,
        "percentual": 0.15
    },
    {
        "name": "SANTA INÊS",
        "votes": 50,
        "zones": 1,
        "sections": 40,
        "locais": 26,
        "percentual": 0.15
    },
    {
        "name": "MIRANDA DO NORTE",
        "votes": 49,
        "zones": 1,
        "sections": 29,
        "locais": 13,
        "percentual": 0.14
    },
    {
        "name": "BURITI BRAVO",
        "votes": 49,
        "zones": 1,
        "sections": 38,
        "locais": 15,
        "percentual": 0.14
    },
    {
        "name": "BACABEIRA",
        "votes": 46,
        "zones": 1,
        "sections": 32,
        "locais": 13,
        "percentual": 0.13
    },
    {
        "name": "AÇAILÂNDIA",
        "votes": 45,
        "zones": 1,
        "sections": 40,
        "locais": 25,
        "percentual": 0.13
    },
    {
        "name": "VIANA",
        "votes": 45,
        "zones": 1,
        "sections": 32,
        "locais": 16,
        "percentual": 0.13
    },
    {
        "name": "BARREIRINHAS",
        "votes": 43,
        "zones": 1,
        "sections": 35,
        "locais": 29,
        "percentual": 0.13
    },
    {
        "name": "SÃO FRANCISCO DO MARANHÃO",
        "votes": 42,
        "zones": 1,
        "sections": 8,
        "locais": 6,
        "percentual": 0.12
    },
    {
        "name": "MATÕES",
        "votes": 42,
        "zones": 1,
        "sections": 32,
        "locais": 16,
        "percentual": 0.12
    },
    {
        "name": "AMARANTE DO MARANHÃO",
        "votes": 41,
        "zones": 1,
        "sections": 31,
        "locais": 16,
        "percentual": 0.12
    },
    {
        "name": "LAGO DA PEDRA",
        "votes": 39,
        "zones": 1,
        "sections": 23,
        "locais": 13,
        "percentual": 0.11
    },
    {
        "name": "PRESIDENTE JUSCELINO",
        "votes": 37,
        "zones": 1,
        "sections": 20,
        "locais": 11,
        "percentual": 0.11
    },
    {
        "name": "TIMBIRAS",
        "votes": 35,
        "zones": 1,
        "sections": 25,
        "locais": 10,
        "percentual": 0.1
    },
    {
        "name": "BARRA DO CORDA",
        "votes": 34,
        "zones": 1,
        "sections": 28,
        "locais": 22,
        "percentual": 0.1
    },
    {
        "name": "SÃO DOMINGOS DO MARANHÃO",
        "votes": 32,
        "zones": 1,
        "sections": 26,
        "locais": 19,
        "percentual": 0.09
    },
    {
        "name": "TUTÓIA",
        "votes": 31,
        "zones": 1,
        "sections": 27,
        "locais": 17,
        "percentual": 0.09
    },
    {
        "name": "ALTO ALEGRE DO MARANHÃO",
        "votes": 30,
        "zones": 1,
        "sections": 22,
        "locais": 9,
        "percentual": 0.09
    },
    {
        "name": "ZÉ DOCA",
        "votes": 29,
        "zones": 1,
        "sections": 22,
        "locais": 12,
        "percentual": 0.08
    },
    {
        "name": "PINHEIRO",
        "votes": 28,
        "zones": 1,
        "sections": 25,
        "locais": 16,
        "percentual": 0.08
    },
    {
        "name": "SANTA LUZIA",
        "votes": 27,
        "zones": 1,
        "sections": 23,
        "locais": 16,
        "percentual": 0.08
    },
    {
        "name": "PERITORÓ",
        "votes": 27,
        "zones": 1,
        "sections": 21,
        "locais": 11,
        "percentual": 0.08
    },
    {
        "name": "CURURUPU",
        "votes": 27,
        "zones": 1,
        "sections": 24,
        "locais": 15,
        "percentual": 0.08
    },
    {
        "name": "ANAJATUBA",
        "votes": 27,
        "zones": 1,
        "sections": 20,
        "locais": 15,
        "percentual": 0.08
    },
    {
        "name": "BURITI",
        "votes": 27,
        "zones": 1,
        "sections": 23,
        "locais": 18,
        "percentual": 0.08
    },
    {
        "name": "SÃO BENEDITO DO RIO PRETO",
        "votes": 27,
        "zones": 1,
        "sections": 17,
        "locais": 13,
        "percentual": 0.08
    },
    {
        "name": "SÃO JOÃO BATISTA",
        "votes": 27,
        "zones": 1,
        "sections": 20,
        "locais": 16,
        "percentual": 0.08
    },
    {
        "name": "HUMBERTO DE CAMPOS",
        "votes": 26,
        "zones": 1,
        "sections": 23,
        "locais": 14,
        "percentual": 0.08
    },
    {
        "name": "ARARI",
        "votes": 26,
        "zones": 1,
        "sections": 21,
        "locais": 12,
        "percentual": 0.08
    },
    {
        "name": "JOÃO LISBOA",
        "votes": 25,
        "zones": 1,
        "sections": 18,
        "locais": 14,
        "percentual": 0.07
    },
    {
        "name": "MATA ROMA",
        "votes": 24,
        "zones": 1,
        "sections": 20,
        "locais": 13,
        "percentual": 0.07
    },
    {
        "name": "PENALVA",
        "votes": 23,
        "zones": 1,
        "sections": 20,
        "locais": 18,
        "percentual": 0.07
    },
    {
        "name": "PEDREIRAS",
        "votes": 23,
        "zones": 1,
        "sections": 22,
        "locais": 13,
        "percentual": 0.07
    },
    {
        "name": "SANTA RITA",
        "votes": 23,
        "zones": 1,
        "sections": 18,
        "locais": 8,
        "percentual": 0.07
    },
    {
        "name": "PIRAPEMAS",
        "votes": 23,
        "zones": 1,
        "sections": 16,
        "locais": 8,
        "percentual": 0.07
    },
    {
        "name": "BALSAS",
        "votes": 23,
        "zones": 1,
        "sections": 22,
        "locais": 15,
        "percentual": 0.07
    },
    {
        "name": "PINDARÉ-MIRIM",
        "votes": 22,
        "zones": 1,
        "sections": 18,
        "locais": 10,
        "percentual": 0.06
    },
    {
        "name": "URBANO SANTOS",
        "votes": 21,
        "zones": 1,
        "sections": 16,
        "locais": 10,
        "percentual": 0.06
    },
    {
        "name": "PRESIDENTE VARGAS",
        "votes": 20,
        "zones": 1,
        "sections": 15,
        "locais": 9,
        "percentual": 0.06
    },
    {
        "name": "PERI MIRIM",
        "votes": 18,
        "zones": 1,
        "sections": 13,
        "locais": 6,
        "percentual": 0.05
    },
    {
        "name": "BURITICUPU",
        "votes": 18,
        "zones": 1,
        "sections": 15,
        "locais": 14,
        "percentual": 0.05
    },
    {
        "name": "MATÕES DO NORTE",
        "votes": 17,
        "zones": 1,
        "sections": 9,
        "locais": 6,
        "percentual": 0.05
    },
    {
        "name": "RIACHÃO",
        "votes": 17,
        "zones": 1,
        "sections": 14,
        "locais": 9,
        "percentual": 0.05
    },
    {
        "name": "MORROS",
        "votes": 16,
        "zones": 1,
        "sections": 9,
        "locais": 7,
        "percentual": 0.05
    },
    {
        "name": "ALCÂNTARA",
        "votes": 15,
        "zones": 1,
        "sections": 11,
        "locais": 10,
        "percentual": 0.04
    },
    {
        "name": "SÃO BENTO",
        "votes": 15,
        "zones": 1,
        "sections": 12,
        "locais": 9,
        "percentual": 0.04
    },
    {
        "name": "TRIZIDELA DO VALE",
        "votes": 14,
        "zones": 1,
        "sections": 12,
        "locais": 9,
        "percentual": 0.04
    },
    {
        "name": "AXIXÁ",
        "votes": 14,
        "zones": 1,
        "sections": 10,
        "locais": 7,
        "percentual": 0.04
    },
    {
        "name": "SÃO VICENTE FERRER",
        "votes": 14,
        "zones": 1,
        "sections": 11,
        "locais": 7,
        "percentual": 0.04
    },
    {
        "name": "VITÓRIA DO MEARIM",
        "votes": 14,
        "zones": 1,
        "sections": 13,
        "locais": 9,
        "percentual": 0.04
    },
    {
        "name": "CAROLINA",
        "votes": 14,
        "zones": 1,
        "sections": 11,
        "locais": 8,
        "percentual": 0.04
    },
    {
        "name": "SANTA QUITÉRIA DO MARANHÃO",
        "votes": 13,
        "zones": 1,
        "sections": 13,
        "locais": 8,
        "percentual": 0.04
    },
    {
        "name": "CEDRAL",
        "votes": 13,
        "zones": 1,
        "sections": 12,
        "locais": 7,
        "percentual": 0.04
    },
    {
        "name": "ANAPURUS",
        "votes": 13,
        "zones": 1,
        "sections": 11,
        "locais": 8,
        "percentual": 0.04
    },
    {
        "name": "SÃO JOSÉ DOS BASÍLIOS",
        "votes": 13,
        "zones": 1,
        "sections": 10,
        "locais": 8,
        "percentual": 0.04
    },
    {
        "name": "MIRINZAL",
        "votes": 13,
        "zones": 1,
        "sections": 10,
        "locais": 6,
        "percentual": 0.04
    },
    {
        "name": "LAGO DOS RODRIGUES",
        "votes": 13,
        "zones": 1,
        "sections": 9,
        "locais": 6,
        "percentual": 0.04
    },
    {
        "name": "SÃO LUÍS GONZAGA DO MARANHÃO",
        "votes": 12,
        "zones": 1,
        "sections": 11,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "CIDELÂNDIA",
        "votes": 12,
        "zones": 1,
        "sections": 11,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "BEQUIMÃO",
        "votes": 12,
        "zones": 1,
        "sections": 11,
        "locais": 8,
        "percentual": 0.03
    },
    {
        "name": "PRIMEIRA CRUZ",
        "votes": 12,
        "zones": 1,
        "sections": 12,
        "locais": 11,
        "percentual": 0.03
    },
    {
        "name": "PAULINO NEVES",
        "votes": 12,
        "zones": 1,
        "sections": 10,
        "locais": 6,
        "percentual": 0.03
    },
    {
        "name": "PASSAGEM FRANCA",
        "votes": 12,
        "zones": 1,
        "sections": 9,
        "locais": 4,
        "percentual": 0.03
    },
    {
        "name": "CARUTAPERA",
        "votes": 12,
        "zones": 1,
        "sections": 9,
        "locais": 8,
        "percentual": 0.03
    },
    {
        "name": "DAVINÓPOLIS",
        "votes": 12,
        "zones": 1,
        "sections": 12,
        "locais": 6,
        "percentual": 0.03
    },
    {
        "name": "ESTREITO",
        "votes": 12,
        "zones": 1,
        "sections": 9,
        "locais": 6,
        "percentual": 0.03
    },
    {
        "name": "SANTANA DO MARANHÃO",
        "votes": 11,
        "zones": 1,
        "sections": 10,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "PIO XII",
        "votes": 11,
        "zones": 1,
        "sections": 10,
        "locais": 8,
        "percentual": 0.03
    },
    {
        "name": "PALMEIRÂNDIA",
        "votes": 11,
        "zones": 1,
        "sections": 9,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "DOM PEDRO",
        "votes": 11,
        "zones": 1,
        "sections": 11,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "ARAME",
        "votes": 11,
        "zones": 1,
        "sections": 11,
        "locais": 11,
        "percentual": 0.03
    },
    {
        "name": "SANTA LUZIA DO PARUÁ",
        "votes": 11,
        "zones": 1,
        "sections": 11,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "MONÇÃO",
        "votes": 11,
        "zones": 1,
        "sections": 11,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "MATINHA",
        "votes": 11,
        "zones": 1,
        "sections": 11,
        "locais": 11,
        "percentual": 0.03
    },
    {
        "name": "TURIAÇU",
        "votes": 11,
        "zones": 1,
        "sections": 9,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "GOVERNADOR LUIZ ROCHA",
        "votes": 11,
        "zones": 1,
        "sections": 5,
        "locais": 3,
        "percentual": 0.03
    },
    {
        "name": "BOM JARDIM",
        "votes": 11,
        "zones": 1,
        "sections": 10,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "LAGO VERDE",
        "votes": 10,
        "zones": 1,
        "sections": 10,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "CAJAPIÓ",
        "votes": 10,
        "zones": 1,
        "sections": 9,
        "locais": 6,
        "percentual": 0.03
    },
    {
        "name": "GOVERNADOR ARCHER",
        "votes": 10,
        "zones": 1,
        "sections": 9,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "GRAÇA ARANHA",
        "votes": 10,
        "zones": 1,
        "sections": 6,
        "locais": 3,
        "percentual": 0.03
    },
    {
        "name": "CONCEIÇÃO DO LAGO-AÇU",
        "votes": 10,
        "zones": 1,
        "sections": 6,
        "locais": 5,
        "percentual": 0.03
    },
    {
        "name": "BELÁGUA",
        "votes": 10,
        "zones": 1,
        "sections": 8,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "LORETO",
        "votes": 10,
        "zones": 1,
        "sections": 9,
        "locais": 5,
        "percentual": 0.03
    },
    {
        "name": "SANTA HELENA",
        "votes": 10,
        "zones": 1,
        "sections": 9,
        "locais": 9,
        "percentual": 0.03
    },
    {
        "name": "TUNTUM",
        "votes": 10,
        "zones": 1,
        "sections": 8,
        "locais": 8,
        "percentual": 0.03
    },
    {
        "name": "NINA RODRIGUES",
        "votes": 10,
        "zones": 1,
        "sections": 9,
        "locais": 8,
        "percentual": 0.03
    },
    {
        "name": "SANTO AMARO DO MARANHÃO",
        "votes": 10,
        "zones": 1,
        "sections": 9,
        "locais": 6,
        "percentual": 0.03
    },
    {
        "name": "SÃO MATEUS DO MARANHÃO",
        "votes": 10,
        "zones": 1,
        "sections": 10,
        "locais": 8,
        "percentual": 0.03
    },
    {
        "name": "GUIMARÃES",
        "votes": 9,
        "zones": 1,
        "sections": 6,
        "locais": 3,
        "percentual": 0.03
    },
    {
        "name": "CACHOEIRA GRANDE",
        "votes": 9,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.03
    },
    {
        "name": "CAJARI",
        "votes": 9,
        "zones": 1,
        "sections": 7,
        "locais": 7,
        "percentual": 0.03
    },
    {
        "name": "LUÍS DOMINGUES",
        "votes": 9,
        "zones": 1,
        "sections": 7,
        "locais": 3,
        "percentual": 0.03
    },
    {
        "name": "SÃO FRANCISCO DO BREJÃO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "SERRANO DO MARANHÃO",
        "votes": 8,
        "zones": 1,
        "sections": 6,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "NOVA COLINAS",
        "votes": 8,
        "zones": 1,
        "sections": 5,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "PAULO RAMOS",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 7,
        "percentual": 0.02
    },
    {
        "name": "OLINDA NOVA DO MARANHÃO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "MILAGRES DO MARANHÃO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "SÃO ROBERTO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "SÍTIO NOVO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 3,
        "percentual": 0.02
    },
    {
        "name": "SENADOR LA ROCQUE",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "BREJO DE AREIA",
        "votes": 8,
        "zones": 1,
        "sections": 6,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "GOVERNADOR EDISON LOBÃO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "BELA VISTA DO MARANHÃO",
        "votes": 8,
        "zones": 1,
        "sections": 7,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "BOM JESUS DAS SELVAS",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "CENTRO NOVO DO MARANHÃO",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "ALTO ALEGRE DO PINDARÉ",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "FORTALEZA DOS NOGUEIRAS",
        "votes": 7,
        "zones": 1,
        "sections": 6,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "CAMPESTRE DO MARANHÃO",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "PEDRO DO ROSÁRIO",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 7,
        "percentual": 0.02
    },
    {
        "name": "SÃO JOÃO DO CARÚ",
        "votes": 7,
        "zones": 1,
        "sections": 6,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "OLHO D ÁGUA DAS CUNHÃS",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "ÁGUA DOCE DO MARANHÃO",
        "votes": 7,
        "zones": 1,
        "sections": 7,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "IGARAPÉ GRANDE",
        "votes": 6,
        "zones": 1,
        "sections": 6,
        "locais": 6,
        "percentual": 0.02
    },
    {
        "name": "TURILÂNDIA",
        "votes": 6,
        "zones": 1,
        "sections": 6,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "SÃO FÉLIX DE BALSAS",
        "votes": 6,
        "zones": 1,
        "sections": 4,
        "locais": 2,
        "percentual": 0.02
    },
    {
        "name": "PORTO FRANCO",
        "votes": 6,
        "zones": 1,
        "sections": 5,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "NOVA OLINDA DO MARANHÃO",
        "votes": 6,
        "zones": 1,
        "sections": 6,
        "locais": 4,
        "percentual": 0.02
    },
    {
        "name": "CENTRO DO GUILHERME",
        "votes": 6,
        "zones": 1,
        "sections": 6,
        "locais": 5,
        "percentual": 0.02
    },
    {
        "name": "VILA NOVA DOS MARTÍRIOS",
        "votes": 5,
        "zones": 1,
        "sections": 5,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "SÃO PEDRO DA ÁGUA BRANCA",
        "votes": 5,
        "zones": 1,
        "sections": 5,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "VITORINO FREIRE",
        "votes": 5,
        "zones": 1,
        "sections": 5,
        "locais": 5,
        "percentual": 0.01
    },
    {
        "name": "GOVERNADOR NUNES FREIRE",
        "votes": 5,
        "zones": 1,
        "sections": 5,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "APICUM-AÇU",
        "votes": 5,
        "zones": 1,
        "sections": 5,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "CÂNDIDO MENDES",
        "votes": 5,
        "zones": 1,
        "sections": 4,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "BOA VISTA DO GURUPI",
        "votes": 5,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "BURITIRANA",
        "votes": 5,
        "zones": 1,
        "sections": 5,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "BACURI",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "RIBAMAR FIQUENE",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "SUCUPIRA DO NORTE",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "MARANHÃOZINHO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "MONTES ALTOS",
        "votes": 4,
        "zones": 1,
        "sections": 3,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "LAGOA DO MATO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "BACURITUBA",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "GODOFREDO VIANA",
        "votes": 4,
        "zones": 1,
        "sections": 3,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "FERNANDO FALCÃO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "CENTRAL DO MARANHÃO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "GOVERNADOR NEWTON BELLO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "SÃO DOMINGOS DO AZEITÃO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "JENIPAPO DOS VIEIRAS",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "LAGOA GRANDE DO MARANHÃO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "LIMA CAMPOS",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "LAGO DO JUNCO",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 4,
        "percentual": 0.01
    },
    {
        "name": "SANTO ANTÔNIO DOS LOPES",
        "votes": 4,
        "zones": 1,
        "sections": 4,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "SUCUPIRA DO RIACHÃO",
        "votes": 3,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "SANTA FILOMENA DO MARANHÃO",
        "votes": 3,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "ALTAMIRA DO MARANHÃO",
        "votes": 3,
        "zones": 1,
        "sections": 3,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "AMAPÁ DO MARANHÃO",
        "votes": 3,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "ARAGUANÃ",
        "votes": 3,
        "zones": 1,
        "sections": 3,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "ITINGA DO MARANHÃO",
        "votes": 3,
        "zones": 1,
        "sections": 3,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "MARACAÇUMÉ",
        "votes": 3,
        "zones": 1,
        "sections": 2,
        "locais": 1,
        "percentual": 0.01
    },
    {
        "name": "BENEDITO LEITE",
        "votes": 3,
        "zones": 1,
        "sections": 3,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "CAPINZAL DO NORTE",
        "votes": 3,
        "zones": 1,
        "sections": 2,
        "locais": 1,
        "percentual": 0.01
    },
    {
        "name": "BOM LUGAR",
        "votes": 3,
        "zones": 1,
        "sections": 3,
        "locais": 3,
        "percentual": 0.01
    },
    {
        "name": "SÃO JOÃO DO PARAÍSO",
        "votes": 2,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0.01
    },
    {
        "name": "IGARAPÉ DO MEIO",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "FEIRA NOVA DO MARANHÃO",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "BERNARDO DO MEARIM",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "ALTO PARNAÍBA",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "JUNCO DO MARANHÃO",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "ITAIPAVA DO GRAJAÚ",
        "votes": 2,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0.01
    },
    {
        "name": "SATUBINHA",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "TUFILÂNDIA",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "SÃO RAIMUNDO DO DOCA BEZERRA",
        "votes": 2,
        "zones": 1,
        "sections": 2,
        "locais": 2,
        "percentual": 0.01
    },
    {
        "name": "FORMOSA DA SERRA NEGRA",
        "votes": 1,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0
    },
    {
        "name": "MARAJÁ DO SENA",
        "votes": 1,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0
    },
    {
        "name": "PRESIDENTE SARNEY",
        "votes": 1,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0
    },
    {
        "name": "PRESIDENTE MÉDICI",
        "votes": 1,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0
    },
    {
        "name": "LAJEADO NOVO",
        "votes": 1,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0
    },
    {
        "name": "TASSO FRAGOSO",
        "votes": 1,
        "zones": 1,
        "sections": 1,
        "locais": 1,
        "percentual": 0
    }
];

export const ADELMO_CITIES_2018: CityData2018[] = [
    {
        "name": "CAXIAS",
        "votes": 3485,
        "zones": 1,
        "sections": 34
    },
    {
        "name": "ROSÁRIO",
        "votes": 66,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ALDEIAS ALTAS",
        "votes": 4031,
        "zones": 1,
        "sections": 40
    },
    {
        "name": "AFONSO CUNHA",
        "votes": 14,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ESPERANTINÓPOLIS",
        "votes": 103,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO LUÍS",
        "votes": 1476,
        "zones": 1,
        "sections": 14
    },
    {
        "name": "JOSELÂNDIA",
        "votes": 51,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MAGALHÃES DE ALMEIDA",
        "votes": 13,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "DUQUE BACELAR",
        "votes": 2221,
        "zones": 1,
        "sections": 22
    },
    {
        "name": "PARAIBANO",
        "votes": 767,
        "zones": 1,
        "sections": 7
    },
    {
        "name": "CANTANHEDE",
        "votes": 1682,
        "zones": 1,
        "sections": 16
    },
    {
        "name": "FORTUNA",
        "votes": 195,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "RAPOSA",
        "votes": 51,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO JOÃO DO SOTER",
        "votes": 243,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "ARAIOSES",
        "votes": 558,
        "zones": 1,
        "sections": 5
    },
    {
        "name": "CODÓ",
        "votes": 1558,
        "zones": 1,
        "sections": 15
    },
    {
        "name": "SÃO JOSÉ DE RIBAMAR",
        "votes": 299,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "PAÇO DO LUMIAR",
        "votes": 336,
        "zones": 1,
        "sections": 3
    },
    {
        "name": "COLINAS",
        "votes": 819,
        "zones": 1,
        "sections": 8
    },
    {
        "name": "PARNARAMA",
        "votes": 441,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "COELHO NETO",
        "votes": 854,
        "zones": 1,
        "sections": 8
    },
    {
        "name": "SÃO RAIMUNDO DAS MANGABEIRAS",
        "votes": 441,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "PASTOS BONS",
        "votes": 138,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MIRADOR",
        "votes": 35,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "VARGEM GRANDE",
        "votes": 64,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BREJO",
        "votes": 32,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SAMBAÍBA",
        "votes": 9,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "JATOBÁ",
        "votes": 144,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CHAPADINHA",
        "votes": 591,
        "zones": 1,
        "sections": 5
    },
    {
        "name": "GOVERNADOR EUGÊNIO BARROS",
        "votes": 53,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO BERNARDO",
        "votes": 120,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "POÇÃO DE PEDRAS",
        "votes": 328,
        "zones": 1,
        "sections": 3
    },
    {
        "name": "IMPERATRIZ",
        "votes": 419,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "GONÇALVES DIAS",
        "votes": 56,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ITAPECURU MIRIM",
        "votes": 503,
        "zones": 1,
        "sections": 5
    },
    {
        "name": "GRAJAÚ",
        "votes": 76,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TIMON",
        "votes": 355,
        "zones": 1,
        "sections": 3
    },
    {
        "name": "SENADOR ALEXANDRE COSTA",
        "votes": 120,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ICATU",
        "votes": 188,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO JOÃO DOS PATOS",
        "votes": 212,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "COROATÁ",
        "votes": 77,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BACABAL",
        "votes": 339,
        "zones": 1,
        "sections": 3
    },
    {
        "name": "NOVA IORQUE",
        "votes": 17,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PRESIDENTE DUTRA",
        "votes": 44,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BARÃO DE GRAJAÚ",
        "votes": 92,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTA INÊS",
        "votes": 85,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BURITI BRAVO",
        "votes": 175,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MIRANDA DO NORTE",
        "votes": 22,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BACABEIRA",
        "votes": 94,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "VIANA",
        "votes": 389,
        "zones": 1,
        "sections": 3
    },
    {
        "name": "AÇAILÂNDIA",
        "votes": 45,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BARREIRINHAS",
        "votes": 1018,
        "zones": 1,
        "sections": 10
    },
    {
        "name": "SÃO FRANCISCO DO MARANHÃO",
        "votes": 11,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MATÕES",
        "votes": 125,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "AMARANTE DO MARANHÃO",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LAGO DA PEDRA",
        "votes": 4346,
        "zones": 1,
        "sections": 43
    },
    {
        "name": "PRESIDENTE JUSCELINO",
        "votes": 24,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TIMBIRAS",
        "votes": 401,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "BARRA DO CORDA",
        "votes": 60,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO DOMINGOS DO MARANHÃO",
        "votes": 65,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TUTÓIA",
        "votes": 177,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ALTO ALEGRE DO MARANHÃO",
        "votes": 667,
        "zones": 1,
        "sections": 6
    },
    {
        "name": "ZÉ DOCA",
        "votes": 208,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "PINHEIRO",
        "votes": 15,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO BENEDITO DO RIO PRETO",
        "votes": 45,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PERITORÓ",
        "votes": 584,
        "zones": 1,
        "sections": 5
    },
    {
        "name": "SANTA LUZIA",
        "votes": 20,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CURURUPU",
        "votes": 199,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ANAJATUBA",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BURITI",
        "votes": 60,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO JOÃO BATISTA",
        "votes": 64,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "HUMBERTO DE CAMPOS",
        "votes": 432,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "ARARI",
        "votes": 51,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "JOÃO LISBOA",
        "votes": 33,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MATA ROMA",
        "votes": 27,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BALSAS",
        "votes": 284,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "SANTA RITA",
        "votes": 94,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PENALVA",
        "votes": 11,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PIRAPEMAS",
        "votes": 14,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PEDREIRAS",
        "votes": 43,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PINDARÉ-MIRIM",
        "votes": 41,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "URBANO SANTOS",
        "votes": 446,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "PRESIDENTE VARGAS",
        "votes": 419,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "BURITICUPU",
        "votes": 73,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MATÕES DO NORTE",
        "votes": 22,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "RIACHÃO",
        "votes": 4,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MORROS",
        "votes": 14,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ALCÂNTARA",
        "votes": 156,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TRIZIDELA DO VALE",
        "votes": 7,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CAROLINA",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "AXIXÁ",
        "votes": 3,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "VITÓRIA DO MEARIM",
        "votes": 46,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO VICENTE FERRER",
        "votes": 7,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ANAPURUS",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LAGO DOS RODRIGUES",
        "votes": 237,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "CEDRAL",
        "votes": 54,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO JOSÉ DOS BASÍLIOS",
        "votes": 7,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTA QUITÉRIA DO MARANHÃO",
        "votes": 456,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "MIRINZAL",
        "votes": 4,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO LUÍS GONZAGA DO MARANHÃO",
        "votes": 37,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ESTREITO",
        "votes": 2,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BEQUIMÃO",
        "votes": 3,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CIDELÂNDIA",
        "votes": 55,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PRIMEIRA CRUZ",
        "votes": 291,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "PAULINO NEVES",
        "votes": 137,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PASSAGEM FRANCA",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CARUTAPERA",
        "votes": 153,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "DAVINÓPOLIS",
        "votes": 18,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTA LUZIA DO PARUÁ",
        "votes": 42,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TURIAÇU",
        "votes": 86,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PIO XII",
        "votes": 19,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BOM JARDIM",
        "votes": 108,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "DOM PEDRO",
        "votes": 13,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ARAME",
        "votes": 16,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MONÇÃO",
        "votes": 30,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MATINHA",
        "votes": 113,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PALMEIRÂNDIA",
        "votes": 4,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTANA DO MARANHÃO",
        "votes": 5,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GOVERNADOR LUIZ ROCHA",
        "votes": 15,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LORETO",
        "votes": 5,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LAGO VERDE",
        "votes": 212,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "CAJAPIÓ",
        "votes": 14,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GOVERNADOR ARCHER",
        "votes": 8,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GRAÇA ARANHA",
        "votes": 10,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CONCEIÇÃO DO LAGO-AÇU",
        "votes": 13,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BELÁGUA",
        "votes": 226,
        "zones": 1,
        "sections": 2
    },
    {
        "name": "SANTA HELENA",
        "votes": 125,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO MATEUS DO MARANHÃO",
        "votes": 29,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TUNTUM",
        "votes": 19,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "NINA RODRIGUES",
        "votes": 10,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTO AMARO DO MARANHÃO",
        "votes": 488,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "CAJARI",
        "votes": 24,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GUIMARÃES",
        "votes": 90,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CACHOEIRA GRANDE",
        "votes": 21,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LUÍS DOMINGUES",
        "votes": 60,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO FRANCISCO DO BREJÃO",
        "votes": 2,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SENADOR LA ROCQUE",
        "votes": 24,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SERRANO DO MARANHÃO",
        "votes": 87,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "NOVA COLINAS",
        "votes": 96,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PAULO RAMOS",
        "votes": 31,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "OLINDA NOVA DO MARANHÃO",
        "votes": 15,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MILAGRES DO MARANHÃO",
        "votes": 13,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÍTIO NOVO",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO ROBERTO",
        "votes": 2,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GOVERNADOR EDISON LOBÃO",
        "votes": 12,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BREJO DE AREIA",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BELA VISTA DO MARANHÃO",
        "votes": 77,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BOM JESUS DAS SELVAS",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CENTRO NOVO DO MARANHÃO",
        "votes": 35,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CAMPESTRE DO MARANHÃO",
        "votes": 37,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ALTO ALEGRE DO PINDARÉ",
        "votes": 80,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "FORTALEZA DOS NOGUEIRAS",
        "votes": 73,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PEDRO DO ROSÁRIO",
        "votes": 169,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "OLHO D ÁGUA DAS CUNHÃS",
        "votes": 55,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ÁGUA DOCE DO MARANHÃO",
        "votes": 38,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO JOÃO DO CARÚ",
        "votes": 21,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "IGARAPÉ GRANDE",
        "votes": 12,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TURILÂNDIA",
        "votes": 28,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO FÉLIX DE BALSAS",
        "votes": 2,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "NOVA OLINDA DO MARANHÃO",
        "votes": 18,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PORTO FRANCO",
        "votes": 3,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "VILA NOVA DOS MARTÍRIOS",
        "votes": 8,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BOA VISTA DO GURUPI",
        "votes": 24,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "VITORINO FREIRE",
        "votes": 49,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO PEDRO DA ÁGUA BRANCA",
        "votes": 5,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GOVERNADOR NUNES FREIRE",
        "votes": 60,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "APICUM-AÇU",
        "votes": 60,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CÂNDIDO MENDES",
        "votes": 112,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BURITIRANA",
        "votes": 3,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTO ANTÔNIO DOS LOPES",
        "votes": 52,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SUCUPIRA DO NORTE",
        "votes": 95,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "RIBAMAR FIQUENE",
        "votes": 673,
        "zones": 1,
        "sections": 6
    },
    {
        "name": "MARANHÃOZINHO",
        "votes": 5,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MONTES ALTOS",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LAGOA GRANDE DO MARANHÃO",
        "votes": 2279,
        "zones": 1,
        "sections": 22
    },
    {
        "name": "BACURI",
        "votes": 143,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "FERNANDO FALCÃO",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CENTRAL DO MARANHÃO",
        "votes": 19,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "GOVERNADOR NEWTON BELLO",
        "votes": 87,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LAGO DO JUNCO",
        "votes": 429,
        "zones": 1,
        "sections": 4
    },
    {
        "name": "LIMA CAMPOS",
        "votes": 29,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "LAGOA DO MATO",
        "votes": 32,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "JENIPAPO DOS VIEIRAS",
        "votes": 8,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO DOMINGOS DO AZEITÃO",
        "votes": 25,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SANTA FILOMENA DO MARANHÃO",
        "votes": 16,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MARACAÇUMÉ",
        "votes": 32,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SUCUPIRA DO RIACHÃO",
        "votes": 21,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ALTAMIRA DO MARANHÃO",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "AMAPÁ DO MARANHÃO",
        "votes": 28,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ARAGUANÃ",
        "votes": 9,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ITINGA DO MARANHÃO",
        "votes": 1,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "CAPINZAL DO NORTE",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BENEDITO LEITE",
        "votes": 194,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BOM LUGAR",
        "votes": 28,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ALTO PARNAÍBA",
        "votes": 8,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO RAIMUNDO DO DOCA BEZERRA",
        "votes": 5,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "IGARAPÉ DO MEIO",
        "votes": 79,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "FEIRA NOVA DO MARANHÃO",
        "votes": 55,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "BERNARDO DO MEARIM",
        "votes": 2,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "ITAIPAVA DO GRAJAÚ",
        "votes": 29,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "JUNCO DO MARANHÃO",
        "votes": 78,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SATUBINHA",
        "votes": 40,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TUFILÂNDIA",
        "votes": 17,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "FORMOSA DA SERRA NEGRA",
        "votes": 2,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "MARAJÁ DO SENA",
        "votes": 27,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PRESIDENTE SARNEY",
        "votes": 16,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "PRESIDENTE MÉDICI",
        "votes": 5,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "TASSO FRAGOSO",
        "votes": 6,
        "zones": 1,
        "sections": 1
    },
    {
        "name": "SÃO PEDRO DOS CRENTES",
        "votes": 6,
        "zones": 1,
        "sections": 1
    }
];

export const ADELMO_CITY_COMPARISON: CityComparison[] = [
    {
        "name": "CAXIAS",
        "votes2018": 3485,
        "votes2022": 8978,
        "pct2018": 7.93,
        "pct2022": 26.13,
        "variacao": 5493,
        "varPct": 157.6183644189383
    },
    {
        "name": "ROSÁRIO",
        "votes2018": 66,
        "votes2022": 3134,
        "pct2018": 0.15,
        "pct2022": 9.12,
        "variacao": 3068,
        "varPct": 4648.484848484848
    },
    {
        "name": "ALDEIAS ALTAS",
        "votes2018": 4031,
        "votes2022": 2273,
        "pct2018": 9.17,
        "pct2022": 6.61,
        "variacao": -1758,
        "varPct": -43.612006946167206
    },
    {
        "name": "AFONSO CUNHA",
        "votes2018": 14,
        "votes2022": 2219,
        "pct2018": 0.03,
        "pct2022": 6.46,
        "variacao": 2205,
        "varPct": 15750
    },
    {
        "name": "ESPERANTINÓPOLIS",
        "votes2018": 103,
        "votes2022": 2070,
        "pct2018": 0.23,
        "pct2022": 6.02,
        "variacao": 1967,
        "varPct": 1909.7087378640776
    },
    {
        "name": "SÃO LUÍS",
        "votes2018": 1476,
        "votes2022": 2069,
        "pct2018": 3.36,
        "pct2022": 6.02,
        "variacao": 593,
        "varPct": 40.176151761517616
    },
    {
        "name": "JOSELÂNDIA",
        "votes2018": 51,
        "votes2022": 978,
        "pct2018": 0.12,
        "pct2022": 2.85,
        "variacao": 927,
        "varPct": 1817.6470588235293
    },
    {
        "name": "MAGALHÃES DE ALMEIDA",
        "votes2018": 13,
        "votes2022": 967,
        "pct2018": 0.03,
        "pct2022": 2.81,
        "variacao": 954,
        "varPct": 7338.461538461539
    },
    {
        "name": "DUQUE BACELAR",
        "votes2018": 2221,
        "votes2022": 833,
        "pct2018": 5.05,
        "pct2022": 2.42,
        "variacao": -1388,
        "varPct": -62.4943719045475
    },
    {
        "name": "PARAIBANO",
        "votes2018": 767,
        "votes2022": 726,
        "pct2018": 1.74,
        "pct2022": 2.11,
        "variacao": -41,
        "varPct": -5.345501955671447
    },
    {
        "name": "CANTANHEDE",
        "votes2018": 1682,
        "votes2022": 662,
        "pct2018": 3.82,
        "pct2022": 1.93,
        "variacao": -1020,
        "varPct": -60.64209274673008
    },
    {
        "name": "FORTUNA",
        "votes2018": 195,
        "votes2022": 658,
        "pct2018": 0.44,
        "pct2022": 1.91,
        "variacao": 463,
        "varPct": 237.43589743589743
    },
    {
        "name": "RAPOSA",
        "votes2018": 51,
        "votes2022": 642,
        "pct2018": 0.12,
        "pct2022": 1.87,
        "variacao": 591,
        "varPct": 1158.8235294117646
    },
    {
        "name": "SÃO JOÃO DO SOTER",
        "votes2018": 243,
        "votes2022": 640,
        "pct2018": 0.55,
        "pct2022": 1.86,
        "variacao": 397,
        "varPct": 163.3744855967078
    },
    {
        "name": "ARAIOSES",
        "votes2018": 558,
        "votes2022": 445,
        "pct2018": 1.27,
        "pct2022": 1.29,
        "variacao": -113,
        "varPct": -20.25089605734767
    },
    {
        "name": "CODÓ",
        "votes2018": 1558,
        "votes2022": 405,
        "pct2018": 3.54,
        "pct2022": 1.18,
        "variacao": -1153,
        "varPct": -74.00513478818999
    },
    {
        "name": "SÃO JOSÉ DE RIBAMAR",
        "votes2018": 299,
        "votes2022": 357,
        "pct2018": 0.68,
        "pct2022": 1.04,
        "variacao": 58,
        "varPct": 19.39799331103679
    },
    {
        "name": "PAÇO DO LUMIAR",
        "votes2018": 336,
        "votes2022": 355,
        "pct2018": 0.76,
        "pct2022": 1.03,
        "variacao": 19,
        "varPct": 5.654761904761905
    },
    {
        "name": "COLINAS",
        "votes2018": 819,
        "votes2022": 293,
        "pct2018": 1.86,
        "pct2022": 0.85,
        "variacao": -526,
        "varPct": -64.22466422466422
    },
    {
        "name": "PARNARAMA",
        "votes2018": 441,
        "votes2022": 292,
        "pct2018": 1,
        "pct2022": 0.85,
        "variacao": -149,
        "varPct": -33.78684807256236
    },
    {
        "name": "COELHO NETO",
        "votes2018": 854,
        "votes2022": 272,
        "pct2018": 1.94,
        "pct2022": 0.79,
        "variacao": -582,
        "varPct": -68.14988290398126
    },
    {
        "name": "SÃO RAIMUNDO DAS MANGABEIRAS",
        "votes2018": 441,
        "votes2022": 267,
        "pct2018": 1,
        "pct2022": 0.78,
        "variacao": -174,
        "varPct": -39.455782312925166
    },
    {
        "name": "PASTOS BONS",
        "votes2018": 138,
        "votes2022": 264,
        "pct2018": 0.31,
        "pct2022": 0.77,
        "variacao": 126,
        "varPct": 91.30434782608695
    },
    {
        "name": "MIRADOR",
        "votes2018": 35,
        "votes2022": 217,
        "pct2018": 0.08,
        "pct2022": 0.63,
        "variacao": 182,
        "varPct": 520
    },
    {
        "name": "VARGEM GRANDE",
        "votes2018": 64,
        "votes2022": 176,
        "pct2018": 0.15,
        "pct2022": 0.51,
        "variacao": 112,
        "varPct": 175
    },
    {
        "name": "BREJO",
        "votes2018": 32,
        "votes2022": 142,
        "pct2018": 0.07,
        "pct2022": 0.41,
        "variacao": 110,
        "varPct": 343.75
    },
    {
        "name": "SAMBAÍBA",
        "votes2018": 9,
        "votes2022": 139,
        "pct2018": 0.02,
        "pct2022": 0.4,
        "variacao": 130,
        "varPct": 1444.4444444444446
    },
    {
        "name": "JATOBÁ",
        "votes2018": 144,
        "votes2022": 128,
        "pct2018": 0.33,
        "pct2022": 0.37,
        "variacao": -16,
        "varPct": -11.11111111111111
    },
    {
        "name": "CHAPADINHA",
        "votes2018": 591,
        "votes2022": 117,
        "pct2018": 1.34,
        "pct2022": 0.34,
        "variacao": -474,
        "varPct": -80.20304568527918
    },
    {
        "name": "GOVERNADOR EUGÊNIO BARROS",
        "votes2018": 53,
        "votes2022": 114,
        "pct2018": 0.12,
        "pct2022": 0.33,
        "variacao": 61,
        "varPct": 115.09433962264151
    },
    {
        "name": "SÃO BERNARDO",
        "votes2018": 120,
        "votes2022": 106,
        "pct2018": 0.27,
        "pct2022": 0.31,
        "variacao": -14,
        "varPct": -11.666666666666666
    },
    {
        "name": "POÇÃO DE PEDRAS",
        "votes2018": 328,
        "votes2022": 102,
        "pct2018": 0.75,
        "pct2022": 0.3,
        "variacao": -226,
        "varPct": -68.90243902439023
    },
    {
        "name": "IMPERATRIZ",
        "votes2018": 419,
        "votes2022": 101,
        "pct2018": 0.95,
        "pct2022": 0.29,
        "variacao": -318,
        "varPct": -75.89498806682577
    },
    {
        "name": "GONÇALVES DIAS",
        "votes2018": 56,
        "votes2022": 99,
        "pct2018": 0.13,
        "pct2022": 0.29,
        "variacao": 43,
        "varPct": 76.78571428571429
    },
    {
        "name": "ITAPECURU MIRIM",
        "votes2018": 503,
        "votes2022": 97,
        "pct2018": 1.14,
        "pct2022": 0.28,
        "variacao": -406,
        "varPct": -80.71570576540755
    },
    {
        "name": "GRAJAÚ",
        "votes2018": 76,
        "votes2022": 95,
        "pct2018": 0.17,
        "pct2022": 0.28,
        "variacao": 19,
        "varPct": 25
    },
    {
        "name": "TIMON",
        "votes2018": 355,
        "votes2022": 93,
        "pct2018": 0.81,
        "pct2022": 0.27,
        "variacao": -262,
        "varPct": -73.80281690140845
    },
    {
        "name": "SENADOR ALEXANDRE COSTA",
        "votes2018": 120,
        "votes2022": 91,
        "pct2018": 0.27,
        "pct2022": 0.26,
        "variacao": -29,
        "varPct": -24.166666666666668
    },
    {
        "name": "ICATU",
        "votes2018": 188,
        "votes2022": 82,
        "pct2018": 0.43,
        "pct2022": 0.24,
        "variacao": -106,
        "varPct": -56.38297872340425
    },
    {
        "name": "SÃO JOÃO DOS PATOS",
        "votes2018": 212,
        "votes2022": 82,
        "pct2018": 0.48,
        "pct2022": 0.24,
        "variacao": -130,
        "varPct": -61.32075471698113
    },
    {
        "name": "COROATÁ",
        "votes2018": 77,
        "votes2022": 66,
        "pct2018": 0.18,
        "pct2022": 0.19,
        "variacao": -11,
        "varPct": -14.285714285714285
    },
    {
        "name": "BACABAL",
        "votes2018": 339,
        "votes2022": 65,
        "pct2018": 0.77,
        "pct2022": 0.19,
        "variacao": -274,
        "varPct": -80.8259587020649
    },
    {
        "name": "PORTO RICO DO MARANHÃO",
        "votes2018": 0,
        "votes2022": 64,
        "pct2018": 0,
        "pct2022": 0.19,
        "variacao": 64,
        "varPct": "inf"
    },
    {
        "name": "NOVA IORQUE",
        "votes2018": 17,
        "votes2022": 57,
        "pct2018": 0.04,
        "pct2022": 0.17,
        "variacao": 40,
        "varPct": 235.29411764705884
    },
    {
        "name": "PRESIDENTE DUTRA",
        "votes2018": 44,
        "votes2022": 57,
        "pct2018": 0.1,
        "pct2022": 0.17,
        "variacao": 13,
        "varPct": 29.545454545454547
    },
    {
        "name": "BARÃO DE GRAJAÚ",
        "votes2018": 92,
        "votes2022": 53,
        "pct2018": 0.21,
        "pct2022": 0.15,
        "variacao": -39,
        "varPct": -42.391304347826086
    },
    {
        "name": "SANTA INÊS",
        "votes2018": 85,
        "votes2022": 50,
        "pct2018": 0.19,
        "pct2022": 0.15,
        "variacao": -35,
        "varPct": -41.17647058823529
    },
    {
        "name": "BURITI BRAVO",
        "votes2018": 175,
        "votes2022": 49,
        "pct2018": 0.4,
        "pct2022": 0.14,
        "variacao": -126,
        "varPct": -72
    },
    {
        "name": "MIRANDA DO NORTE",
        "votes2018": 22,
        "votes2022": 49,
        "pct2018": 0.05,
        "pct2022": 0.14,
        "variacao": 27,
        "varPct": 122.72727272727273
    },
    {
        "name": "BACABEIRA",
        "votes2018": 94,
        "votes2022": 46,
        "pct2018": 0.21,
        "pct2022": 0.13,
        "variacao": -48,
        "varPct": -51.06382978723404
    },
    {
        "name": "VIANA",
        "votes2018": 389,
        "votes2022": 45,
        "pct2018": 0.88,
        "pct2022": 0.13,
        "variacao": -344,
        "varPct": -88.4318766066838
    },
    {
        "name": "AÇAILÂNDIA",
        "votes2018": 45,
        "votes2022": 45,
        "pct2018": 0.1,
        "pct2022": 0.13,
        "variacao": 0,
        "varPct": 0
    },
    {
        "name": "BARREIRINHAS",
        "votes2018": 1018,
        "votes2022": 43,
        "pct2018": 2.32,
        "pct2022": 0.13,
        "variacao": -975,
        "varPct": -95.77603143418467
    },
    {
        "name": "SÃO FRANCISCO DO MARANHÃO",
        "votes2018": 11,
        "votes2022": 42,
        "pct2018": 0.03,
        "pct2022": 0.12,
        "variacao": 31,
        "varPct": 281.8181818181818
    },
    {
        "name": "MATÕES",
        "votes2018": 125,
        "votes2022": 42,
        "pct2018": 0.28,
        "pct2022": 0.12,
        "variacao": -83,
        "varPct": -66.4
    },
    {
        "name": "AMARANTE DO MARANHÃO",
        "votes2018": 6,
        "votes2022": 41,
        "pct2018": 0.01,
        "pct2022": 0.12,
        "variacao": 35,
        "varPct": 583.3333333333333
    },
    {
        "name": "LAGO DA PEDRA",
        "votes2018": 4346,
        "votes2022": 39,
        "pct2018": 9.88,
        "pct2022": 0.11,
        "variacao": -4307,
        "varPct": -99.10262310170272
    },
    {
        "name": "PRESIDENTE JUSCELINO",
        "votes2018": 24,
        "votes2022": 37,
        "pct2018": 0.05,
        "pct2022": 0.11,
        "variacao": 13,
        "varPct": 54.166666666666664
    },
    {
        "name": "TIMBIRAS",
        "votes2018": 401,
        "votes2022": 35,
        "pct2018": 0.91,
        "pct2022": 0.1,
        "variacao": -366,
        "varPct": -91.2718204488778
    },
    {
        "name": "BARRA DO CORDA",
        "votes2018": 60,
        "votes2022": 34,
        "pct2018": 0.14,
        "pct2022": 0.1,
        "variacao": -26,
        "varPct": -43.333333333333336
    },
    {
        "name": "SÃO DOMINGOS DO MARANHÃO",
        "votes2018": 65,
        "votes2022": 32,
        "pct2018": 0.15,
        "pct2022": 0.09,
        "variacao": -33,
        "varPct": -50.76923076923077
    },
    {
        "name": "TUTÓIA",
        "votes2018": 177,
        "votes2022": 31,
        "pct2018": 0.4,
        "pct2022": 0.09,
        "variacao": -146,
        "varPct": -82.48587570621469
    },
    {
        "name": "ALTO ALEGRE DO MARANHÃO",
        "votes2018": 667,
        "votes2022": 30,
        "pct2018": 1.52,
        "pct2022": 0.09,
        "variacao": -637,
        "varPct": -95.50224887556223
    },
    {
        "name": "ZÉ DOCA",
        "votes2018": 208,
        "votes2022": 29,
        "pct2018": 0.47,
        "pct2022": 0.08,
        "variacao": -179,
        "varPct": -86.0576923076923
    },
    {
        "name": "PINHEIRO",
        "votes2018": 15,
        "votes2022": 28,
        "pct2018": 0.03,
        "pct2022": 0.08,
        "variacao": 13,
        "varPct": 86.66666666666667
    },
    {
        "name": "SÃO BENEDITO DO RIO PRETO",
        "votes2018": 45,
        "votes2022": 27,
        "pct2018": 0.1,
        "pct2022": 0.08,
        "variacao": -18,
        "varPct": -40
    },
    {
        "name": "PERITORÓ",
        "votes2018": 584,
        "votes2022": 27,
        "pct2018": 1.33,
        "pct2022": 0.08,
        "variacao": -557,
        "varPct": -95.37671232876713
    },
    {
        "name": "SANTA LUZIA",
        "votes2018": 20,
        "votes2022": 27,
        "pct2018": 0.05,
        "pct2022": 0.08,
        "variacao": 7,
        "varPct": 35
    },
    {
        "name": "CURURUPU",
        "votes2018": 199,
        "votes2022": 27,
        "pct2018": 0.45,
        "pct2022": 0.08,
        "variacao": -172,
        "varPct": -86.4321608040201
    },
    {
        "name": "ANAJATUBA",
        "votes2018": 6,
        "votes2022": 27,
        "pct2018": 0.01,
        "pct2022": 0.08,
        "variacao": 21,
        "varPct": 350
    },
    {
        "name": "BURITI",
        "votes2018": 60,
        "votes2022": 27,
        "pct2018": 0.14,
        "pct2022": 0.08,
        "variacao": -33,
        "varPct": -55.00000000000001
    },
    {
        "name": "SÃO JOÃO BATISTA",
        "votes2018": 64,
        "votes2022": 27,
        "pct2018": 0.15,
        "pct2022": 0.08,
        "variacao": -37,
        "varPct": -57.8125
    },
    {
        "name": "HUMBERTO DE CAMPOS",
        "votes2018": 432,
        "votes2022": 26,
        "pct2018": 0.98,
        "pct2022": 0.08,
        "variacao": -406,
        "varPct": -93.98148148148148
    },
    {
        "name": "ARARI",
        "votes2018": 51,
        "votes2022": 26,
        "pct2018": 0.12,
        "pct2022": 0.08,
        "variacao": -25,
        "varPct": -49.01960784313725
    },
    {
        "name": "JOÃO LISBOA",
        "votes2018": 33,
        "votes2022": 25,
        "pct2018": 0.08,
        "pct2022": 0.07,
        "variacao": -8,
        "varPct": -24.242424242424242
    },
    {
        "name": "MATA ROMA",
        "votes2018": 27,
        "votes2022": 24,
        "pct2018": 0.06,
        "pct2022": 0.07,
        "variacao": -3,
        "varPct": -11.11111111111111
    },
    {
        "name": "BALSAS",
        "votes2018": 284,
        "votes2022": 23,
        "pct2018": 0.65,
        "pct2022": 0.07,
        "variacao": -261,
        "varPct": -91.90140845070422
    },
    {
        "name": "SANTA RITA",
        "votes2018": 94,
        "votes2022": 23,
        "pct2018": 0.21,
        "pct2022": 0.07,
        "variacao": -71,
        "varPct": -75.53191489361703
    },
    {
        "name": "PENALVA",
        "votes2018": 11,
        "votes2022": 23,
        "pct2018": 0.03,
        "pct2022": 0.07,
        "variacao": 12,
        "varPct": 109.09090909090908
    },
    {
        "name": "PIRAPEMAS",
        "votes2018": 14,
        "votes2022": 23,
        "pct2018": 0.03,
        "pct2022": 0.07,
        "variacao": 9,
        "varPct": 64.28571428571429
    },
    {
        "name": "PEDREIRAS",
        "votes2018": 43,
        "votes2022": 23,
        "pct2018": 0.1,
        "pct2022": 0.07,
        "variacao": -20,
        "varPct": -46.51162790697674
    },
    {
        "name": "PINDARÉ-MIRIM",
        "votes2018": 41,
        "votes2022": 22,
        "pct2018": 0.09,
        "pct2022": 0.06,
        "variacao": -19,
        "varPct": -46.34146341463415
    },
    {
        "name": "URBANO SANTOS",
        "votes2018": 446,
        "votes2022": 21,
        "pct2018": 1.01,
        "pct2022": 0.06,
        "variacao": -425,
        "varPct": -95.2914798206278
    },
    {
        "name": "PRESIDENTE VARGAS",
        "votes2018": 419,
        "votes2022": 20,
        "pct2018": 0.95,
        "pct2022": 0.06,
        "variacao": -399,
        "varPct": -95.22673031026252
    },
    {
        "name": "BURITICUPU",
        "votes2018": 73,
        "votes2022": 18,
        "pct2018": 0.17,
        "pct2022": 0.05,
        "variacao": -55,
        "varPct": -75.34246575342466
    },
    {
        "name": "PERI MIRIM",
        "votes2018": 0,
        "votes2022": 18,
        "pct2018": 0,
        "pct2022": 0.05,
        "variacao": 18,
        "varPct": "inf"
    },
    {
        "name": "MATÕES DO NORTE",
        "votes2018": 22,
        "votes2022": 17,
        "pct2018": 0.05,
        "pct2022": 0.05,
        "variacao": -5,
        "varPct": -22.727272727272727
    },
    {
        "name": "RIACHÃO",
        "votes2018": 4,
        "votes2022": 17,
        "pct2018": 0.01,
        "pct2022": 0.05,
        "variacao": 13,
        "varPct": 325
    },
    {
        "name": "MORROS",
        "votes2018": 14,
        "votes2022": 16,
        "pct2018": 0.03,
        "pct2022": 0.05,
        "variacao": 2,
        "varPct": 14.285714285714285
    },
    {
        "name": "SÃO BENTO",
        "votes2018": 0,
        "votes2022": 15,
        "pct2018": 0,
        "pct2022": 0.04,
        "variacao": 15,
        "varPct": "inf"
    },
    {
        "name": "ALCÂNTARA",
        "votes2018": 156,
        "votes2022": 15,
        "pct2018": 0.35,
        "pct2022": 0.04,
        "variacao": -141,
        "varPct": -90.38461538461539
    },
    {
        "name": "TRIZIDELA DO VALE",
        "votes2018": 7,
        "votes2022": 14,
        "pct2018": 0.02,
        "pct2022": 0.04,
        "variacao": 7,
        "varPct": 100
    },
    {
        "name": "CAROLINA",
        "votes2018": 1,
        "votes2022": 14,
        "pct2018": 0,
        "pct2022": 0.04,
        "variacao": 13,
        "varPct": 1300
    },
    {
        "name": "AXIXÁ",
        "votes2018": 3,
        "votes2022": 14,
        "pct2018": 0.01,
        "pct2022": 0.04,
        "variacao": 11,
        "varPct": 366.66666666666663
    },
    {
        "name": "VITÓRIA DO MEARIM",
        "votes2018": 46,
        "votes2022": 14,
        "pct2018": 0.1,
        "pct2022": 0.04,
        "variacao": -32,
        "varPct": -69.56521739130434
    },
    {
        "name": "SÃO VICENTE FERRER",
        "votes2018": 7,
        "votes2022": 14,
        "pct2018": 0.02,
        "pct2022": 0.04,
        "variacao": 7,
        "varPct": 100
    },
    {
        "name": "ANAPURUS",
        "votes2018": 6,
        "votes2022": 13,
        "pct2018": 0.01,
        "pct2022": 0.04,
        "variacao": 7,
        "varPct": 116.66666666666667
    },
    {
        "name": "LAGO DOS RODRIGUES",
        "votes2018": 237,
        "votes2022": 13,
        "pct2018": 0.54,
        "pct2022": 0.04,
        "variacao": -224,
        "varPct": -94.51476793248945
    },
    {
        "name": "CEDRAL",
        "votes2018": 54,
        "votes2022": 13,
        "pct2018": 0.12,
        "pct2022": 0.04,
        "variacao": -41,
        "varPct": -75.92592592592592
    },
    {
        "name": "SÃO JOSÉ DOS BASÍLIOS",
        "votes2018": 7,
        "votes2022": 13,
        "pct2018": 0.02,
        "pct2022": 0.04,
        "variacao": 6,
        "varPct": 85.71428571428571
    },
    {
        "name": "SANTA QUITÉRIA DO MARANHÃO",
        "votes2018": 456,
        "votes2022": 13,
        "pct2018": 1.04,
        "pct2022": 0.04,
        "variacao": -443,
        "varPct": -97.14912280701753
    },
    {
        "name": "MIRINZAL",
        "votes2018": 4,
        "votes2022": 13,
        "pct2018": 0.01,
        "pct2022": 0.04,
        "variacao": 9,
        "varPct": 225
    },
    {
        "name": "SÃO LUÍS GONZAGA DO MARANHÃO",
        "votes2018": 37,
        "votes2022": 12,
        "pct2018": 0.08,
        "pct2022": 0.03,
        "variacao": -25,
        "varPct": -67.56756756756756
    },
    {
        "name": "ESTREITO",
        "votes2018": 2,
        "votes2022": 12,
        "pct2018": 0,
        "pct2022": 0.03,
        "variacao": 10,
        "varPct": 500
    },
    {
        "name": "BEQUIMÃO",
        "votes2018": 3,
        "votes2022": 12,
        "pct2018": 0.01,
        "pct2022": 0.03,
        "variacao": 9,
        "varPct": 300
    },
    {
        "name": "CIDELÂNDIA",
        "votes2018": 55,
        "votes2022": 12,
        "pct2018": 0.13,
        "pct2022": 0.03,
        "variacao": -43,
        "varPct": -78.18181818181819
    },
    {
        "name": "PRIMEIRA CRUZ",
        "votes2018": 291,
        "votes2022": 12,
        "pct2018": 0.66,
        "pct2022": 0.03,
        "variacao": -279,
        "varPct": -95.87628865979381
    },
    {
        "name": "PAULINO NEVES",
        "votes2018": 137,
        "votes2022": 12,
        "pct2018": 0.31,
        "pct2022": 0.03,
        "variacao": -125,
        "varPct": -91.24087591240875
    },
    {
        "name": "PASSAGEM FRANCA",
        "votes2018": 1,
        "votes2022": 12,
        "pct2018": 0,
        "pct2022": 0.03,
        "variacao": 11,
        "varPct": 1100
    },
    {
        "name": "CARUTAPERA",
        "votes2018": 153,
        "votes2022": 12,
        "pct2018": 0.35,
        "pct2022": 0.03,
        "variacao": -141,
        "varPct": -92.15686274509804
    },
    {
        "name": "DAVINÓPOLIS",
        "votes2018": 18,
        "votes2022": 12,
        "pct2018": 0.04,
        "pct2022": 0.03,
        "variacao": -6,
        "varPct": -33.33333333333333
    },
    {
        "name": "SANTA LUZIA DO PARUÁ",
        "votes2018": 42,
        "votes2022": 11,
        "pct2018": 0.1,
        "pct2022": 0.03,
        "variacao": -31,
        "varPct": -73.80952380952381
    },
    {
        "name": "TURIAÇU",
        "votes2018": 86,
        "votes2022": 11,
        "pct2018": 0.2,
        "pct2022": 0.03,
        "variacao": -75,
        "varPct": -87.20930232558139
    },
    {
        "name": "PIO XII",
        "votes2018": 19,
        "votes2022": 11,
        "pct2018": 0.04,
        "pct2022": 0.03,
        "variacao": -8,
        "varPct": -42.10526315789473
    },
    {
        "name": "BOM JARDIM",
        "votes2018": 108,
        "votes2022": 11,
        "pct2018": 0.25,
        "pct2022": 0.03,
        "variacao": -97,
        "varPct": -89.81481481481481
    },
    {
        "name": "DOM PEDRO",
        "votes2018": 13,
        "votes2022": 11,
        "pct2018": 0.03,
        "pct2022": 0.03,
        "variacao": -2,
        "varPct": -15.384615384615385
    },
    {
        "name": "ARAME",
        "votes2018": 16,
        "votes2022": 11,
        "pct2018": 0.04,
        "pct2022": 0.03,
        "variacao": -5,
        "varPct": -31.25
    },
    {
        "name": "MONÇÃO",
        "votes2018": 30,
        "votes2022": 11,
        "pct2018": 0.07,
        "pct2022": 0.03,
        "variacao": -19,
        "varPct": -63.33333333333333
    },
    {
        "name": "MATINHA",
        "votes2018": 113,
        "votes2022": 11,
        "pct2018": 0.26,
        "pct2022": 0.03,
        "variacao": -102,
        "varPct": -90.2654867256637
    },
    {
        "name": "PALMEIRÂNDIA",
        "votes2018": 4,
        "votes2022": 11,
        "pct2018": 0.01,
        "pct2022": 0.03,
        "variacao": 7,
        "varPct": 175
    },
    {
        "name": "SANTANA DO MARANHÃO",
        "votes2018": 5,
        "votes2022": 11,
        "pct2018": 0.01,
        "pct2022": 0.03,
        "variacao": 6,
        "varPct": 120
    },
    {
        "name": "GOVERNADOR LUIZ ROCHA",
        "votes2018": 15,
        "votes2022": 11,
        "pct2018": 0.03,
        "pct2022": 0.03,
        "variacao": -4,
        "varPct": -26.666666666666668
    },
    {
        "name": "LORETO",
        "votes2018": 5,
        "votes2022": 10,
        "pct2018": 0.01,
        "pct2022": 0.03,
        "variacao": 5,
        "varPct": 100
    },
    {
        "name": "LAGO VERDE",
        "votes2018": 212,
        "votes2022": 10,
        "pct2018": 0.48,
        "pct2022": 0.03,
        "variacao": -202,
        "varPct": -95.28301886792453
    },
    {
        "name": "CAJAPIÓ",
        "votes2018": 14,
        "votes2022": 10,
        "pct2018": 0.03,
        "pct2022": 0.03,
        "variacao": -4,
        "varPct": -28.57142857142857
    },
    {
        "name": "GOVERNADOR ARCHER",
        "votes2018": 8,
        "votes2022": 10,
        "pct2018": 0.02,
        "pct2022": 0.03,
        "variacao": 2,
        "varPct": 25
    },
    {
        "name": "GRAÇA ARANHA",
        "votes2018": 10,
        "votes2022": 10,
        "pct2018": 0.02,
        "pct2022": 0.03,
        "variacao": 0,
        "varPct": 0
    },
    {
        "name": "CONCEIÇÃO DO LAGO-AÇU",
        "votes2018": 13,
        "votes2022": 10,
        "pct2018": 0.03,
        "pct2022": 0.03,
        "variacao": -3,
        "varPct": -23.076923076923077
    },
    {
        "name": "BELÁGUA",
        "votes2018": 226,
        "votes2022": 10,
        "pct2018": 0.51,
        "pct2022": 0.03,
        "variacao": -216,
        "varPct": -95.57522123893806
    },
    {
        "name": "SANTA HELENA",
        "votes2018": 125,
        "votes2022": 10,
        "pct2018": 0.28,
        "pct2022": 0.03,
        "variacao": -115,
        "varPct": -92
    },
    {
        "name": "SÃO MATEUS DO MARANHÃO",
        "votes2018": 29,
        "votes2022": 10,
        "pct2018": 0.07,
        "pct2022": 0.03,
        "variacao": -19,
        "varPct": -65.51724137931035
    },
    {
        "name": "TUNTUM",
        "votes2018": 19,
        "votes2022": 10,
        "pct2018": 0.04,
        "pct2022": 0.03,
        "variacao": -9,
        "varPct": -47.368421052631575
    },
    {
        "name": "NINA RODRIGUES",
        "votes2018": 10,
        "votes2022": 10,
        "pct2018": 0.02,
        "pct2022": 0.03,
        "variacao": 0,
        "varPct": 0
    },
    {
        "name": "SANTO AMARO DO MARANHÃO",
        "votes2018": 488,
        "votes2022": 10,
        "pct2018": 1.11,
        "pct2022": 0.03,
        "variacao": -478,
        "varPct": -97.95081967213115
    },
    {
        "name": "CAJARI",
        "votes2018": 24,
        "votes2022": 9,
        "pct2018": 0.05,
        "pct2022": 0.03,
        "variacao": -15,
        "varPct": -62.5
    },
    {
        "name": "GUIMARÃES",
        "votes2018": 90,
        "votes2022": 9,
        "pct2018": 0.2,
        "pct2022": 0.03,
        "variacao": -81,
        "varPct": -90
    },
    {
        "name": "CACHOEIRA GRANDE",
        "votes2018": 21,
        "votes2022": 9,
        "pct2018": 0.05,
        "pct2022": 0.03,
        "variacao": -12,
        "varPct": -57.14285714285714
    },
    {
        "name": "LUÍS DOMINGUES",
        "votes2018": 60,
        "votes2022": 9,
        "pct2018": 0.14,
        "pct2022": 0.03,
        "variacao": -51,
        "varPct": -85
    },
    {
        "name": "SÃO FRANCISCO DO BREJÃO",
        "votes2018": 2,
        "votes2022": 8,
        "pct2018": 0,
        "pct2022": 0.02,
        "variacao": 6,
        "varPct": 300
    },
    {
        "name": "SENADOR LA ROCQUE",
        "votes2018": 24,
        "votes2022": 8,
        "pct2018": 0.05,
        "pct2022": 0.02,
        "variacao": -16,
        "varPct": -66.66666666666666
    },
    {
        "name": "SERRANO DO MARANHÃO",
        "votes2018": 87,
        "votes2022": 8,
        "pct2018": 0.2,
        "pct2022": 0.02,
        "variacao": -79,
        "varPct": -90.80459770114942
    },
    {
        "name": "NOVA COLINAS",
        "votes2018": 96,
        "votes2022": 8,
        "pct2018": 0.22,
        "pct2022": 0.02,
        "variacao": -88,
        "varPct": -91.66666666666666
    },
    {
        "name": "PAULO RAMOS",
        "votes2018": 31,
        "votes2022": 8,
        "pct2018": 0.07,
        "pct2022": 0.02,
        "variacao": -23,
        "varPct": -74.19354838709677
    },
    {
        "name": "OLINDA NOVA DO MARANHÃO",
        "votes2018": 15,
        "votes2022": 8,
        "pct2018": 0.03,
        "pct2022": 0.02,
        "variacao": -7,
        "varPct": -46.666666666666664
    },
    {
        "name": "MILAGRES DO MARANHÃO",
        "votes2018": 13,
        "votes2022": 8,
        "pct2018": 0.03,
        "pct2022": 0.02,
        "variacao": -5,
        "varPct": -38.46153846153847
    },
    {
        "name": "SÍTIO NOVO",
        "votes2018": 1,
        "votes2022": 8,
        "pct2018": 0,
        "pct2022": 0.02,
        "variacao": 7,
        "varPct": 700
    },
    {
        "name": "SÃO ROBERTO",
        "votes2018": 2,
        "votes2022": 8,
        "pct2018": 0,
        "pct2022": 0.02,
        "variacao": 6,
        "varPct": 300
    },
    {
        "name": "GOVERNADOR EDISON LOBÃO",
        "votes2018": 12,
        "votes2022": 8,
        "pct2018": 0.03,
        "pct2022": 0.02,
        "variacao": -4,
        "varPct": -33.33333333333333
    },
    {
        "name": "BREJO DE AREIA",
        "votes2018": 6,
        "votes2022": 8,
        "pct2018": 0.01,
        "pct2022": 0.02,
        "variacao": 2,
        "varPct": 33.33333333333333
    },
    {
        "name": "BELA VISTA DO MARANHÃO",
        "votes2018": 77,
        "votes2022": 8,
        "pct2018": 0.18,
        "pct2022": 0.02,
        "variacao": -69,
        "varPct": -89.6103896103896
    },
    {
        "name": "BOM JESUS DAS SELVAS",
        "votes2018": 1,
        "votes2022": 7,
        "pct2018": 0,
        "pct2022": 0.02,
        "variacao": 6,
        "varPct": 600
    },
    {
        "name": "CENTRO NOVO DO MARANHÃO",
        "votes2018": 35,
        "votes2022": 7,
        "pct2018": 0.08,
        "pct2022": 0.02,
        "variacao": -28,
        "varPct": -80
    },
    {
        "name": "CAMPESTRE DO MARANHÃO",
        "votes2018": 37,
        "votes2022": 7,
        "pct2018": 0.08,
        "pct2022": 0.02,
        "variacao": -30,
        "varPct": -81.08108108108108
    },
    {
        "name": "ALTO ALEGRE DO PINDARÉ",
        "votes2018": 80,
        "votes2022": 7,
        "pct2018": 0.18,
        "pct2022": 0.02,
        "variacao": -73,
        "varPct": -91.25
    },
    {
        "name": "FORTALEZA DOS NOGUEIRAS",
        "votes2018": 73,
        "votes2022": 7,
        "pct2018": 0.17,
        "pct2022": 0.02,
        "variacao": -66,
        "varPct": -90.41095890410958
    },
    {
        "name": "PEDRO DO ROSÁRIO",
        "votes2018": 169,
        "votes2022": 7,
        "pct2018": 0.38,
        "pct2022": 0.02,
        "variacao": -162,
        "varPct": -95.85798816568047
    },
    {
        "name": "OLHO D ÁGUA DAS CUNHÃS",
        "votes2018": 55,
        "votes2022": 7,
        "pct2018": 0.13,
        "pct2022": 0.02,
        "variacao": -48,
        "varPct": -87.27272727272727
    },
    {
        "name": "ÁGUA DOCE DO MARANHÃO",
        "votes2018": 38,
        "votes2022": 7,
        "pct2018": 0.09,
        "pct2022": 0.02,
        "variacao": -31,
        "varPct": -81.57894736842105
    },
    {
        "name": "SÃO JOÃO DO CARÚ",
        "votes2018": 21,
        "votes2022": 7,
        "pct2018": 0.05,
        "pct2022": 0.02,
        "variacao": -14,
        "varPct": -66.66666666666666
    },
    {
        "name": "CENTRO DO GUILHERME",
        "votes2018": 0,
        "votes2022": 6,
        "pct2018": 0,
        "pct2022": 0.02,
        "variacao": 6,
        "varPct": "inf"
    },
    {
        "name": "IGARAPÉ GRANDE",
        "votes2018": 12,
        "votes2022": 6,
        "pct2018": 0.03,
        "pct2022": 0.02,
        "variacao": -6,
        "varPct": -50
    },
    {
        "name": "TURILÂNDIA",
        "votes2018": 28,
        "votes2022": 6,
        "pct2018": 0.06,
        "pct2022": 0.02,
        "variacao": -22,
        "varPct": -78.57142857142857
    },
    {
        "name": "SÃO FÉLIX DE BALSAS",
        "votes2018": 2,
        "votes2022": 6,
        "pct2018": 0,
        "pct2022": 0.02,
        "variacao": 4,
        "varPct": 200
    },
    {
        "name": "NOVA OLINDA DO MARANHÃO",
        "votes2018": 18,
        "votes2022": 6,
        "pct2018": 0.04,
        "pct2022": 0.02,
        "variacao": -12,
        "varPct": -66.66666666666666
    },
    {
        "name": "PORTO FRANCO",
        "votes2018": 3,
        "votes2022": 6,
        "pct2018": 0.01,
        "pct2022": 0.02,
        "variacao": 3,
        "varPct": 100
    },
    {
        "name": "VILA NOVA DOS MARTÍRIOS",
        "votes2018": 8,
        "votes2022": 5,
        "pct2018": 0.02,
        "pct2022": 0.01,
        "variacao": -3,
        "varPct": -37.5
    },
    {
        "name": "BOA VISTA DO GURUPI",
        "votes2018": 24,
        "votes2022": 5,
        "pct2018": 0.05,
        "pct2022": 0.01,
        "variacao": -19,
        "varPct": -79.16666666666666
    },
    {
        "name": "VITORINO FREIRE",
        "votes2018": 49,
        "votes2022": 5,
        "pct2018": 0.11,
        "pct2022": 0.01,
        "variacao": -44,
        "varPct": -89.79591836734694
    },
    {
        "name": "SÃO PEDRO DA ÁGUA BRANCA",
        "votes2018": 5,
        "votes2022": 5,
        "pct2018": 0.01,
        "pct2022": 0.01,
        "variacao": 0,
        "varPct": 0
    },
    {
        "name": "GOVERNADOR NUNES FREIRE",
        "votes2018": 60,
        "votes2022": 5,
        "pct2018": 0.14,
        "pct2022": 0.01,
        "variacao": -55,
        "varPct": -91.66666666666666
    },
    {
        "name": "APICUM-AÇU",
        "votes2018": 60,
        "votes2022": 5,
        "pct2018": 0.14,
        "pct2022": 0.01,
        "variacao": -55,
        "varPct": -91.66666666666666
    },
    {
        "name": "CÂNDIDO MENDES",
        "votes2018": 112,
        "votes2022": 5,
        "pct2018": 0.25,
        "pct2022": 0.01,
        "variacao": -107,
        "varPct": -95.53571428571429
    },
    {
        "name": "BURITIRANA",
        "votes2018": 3,
        "votes2022": 5,
        "pct2018": 0.01,
        "pct2022": 0.01,
        "variacao": 2,
        "varPct": 66.66666666666666
    },
    {
        "name": "BACURITUBA",
        "votes2018": 0,
        "votes2022": 4,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 4,
        "varPct": "inf"
    },
    {
        "name": "SANTO ANTÔNIO DOS LOPES",
        "votes2018": 52,
        "votes2022": 4,
        "pct2018": 0.12,
        "pct2022": 0.01,
        "variacao": -48,
        "varPct": -92.3076923076923
    },
    {
        "name": "SUCUPIRA DO NORTE",
        "votes2018": 95,
        "votes2022": 4,
        "pct2018": 0.22,
        "pct2022": 0.01,
        "variacao": -91,
        "varPct": -95.78947368421052
    },
    {
        "name": "RIBAMAR FIQUENE",
        "votes2018": 673,
        "votes2022": 4,
        "pct2018": 1.53,
        "pct2022": 0.01,
        "variacao": -669,
        "varPct": -99.40564635958395
    },
    {
        "name": "MARANHÃOZINHO",
        "votes2018": 5,
        "votes2022": 4,
        "pct2018": 0.01,
        "pct2022": 0.01,
        "variacao": -1,
        "varPct": -20
    },
    {
        "name": "MONTES ALTOS",
        "votes2018": 1,
        "votes2022": 4,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 3,
        "varPct": 300
    },
    {
        "name": "LAGOA GRANDE DO MARANHÃO",
        "votes2018": 2279,
        "votes2022": 4,
        "pct2018": 5.18,
        "pct2022": 0.01,
        "variacao": -2275,
        "varPct": -99.82448442299254
    },
    {
        "name": "BACURI",
        "votes2018": 143,
        "votes2022": 4,
        "pct2018": 0.33,
        "pct2022": 0.01,
        "variacao": -139,
        "varPct": -97.2027972027972
    },
    {
        "name": "GODOFREDO VIANA",
        "votes2018": 0,
        "votes2022": 4,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 4,
        "varPct": "inf"
    },
    {
        "name": "FERNANDO FALCÃO",
        "votes2018": 6,
        "votes2022": 4,
        "pct2018": 0.01,
        "pct2022": 0.01,
        "variacao": -2,
        "varPct": -33.33333333333333
    },
    {
        "name": "CENTRAL DO MARANHÃO",
        "votes2018": 19,
        "votes2022": 4,
        "pct2018": 0.04,
        "pct2022": 0.01,
        "variacao": -15,
        "varPct": -78.94736842105263
    },
    {
        "name": "GOVERNADOR NEWTON BELLO",
        "votes2018": 87,
        "votes2022": 4,
        "pct2018": 0.2,
        "pct2022": 0.01,
        "variacao": -83,
        "varPct": -95.40229885057471
    },
    {
        "name": "LAGO DO JUNCO",
        "votes2018": 429,
        "votes2022": 4,
        "pct2018": 0.98,
        "pct2022": 0.01,
        "variacao": -425,
        "varPct": -99.06759906759906
    },
    {
        "name": "LIMA CAMPOS",
        "votes2018": 29,
        "votes2022": 4,
        "pct2018": 0.07,
        "pct2022": 0.01,
        "variacao": -25,
        "varPct": -86.20689655172413
    },
    {
        "name": "LAGOA DO MATO",
        "votes2018": 32,
        "votes2022": 4,
        "pct2018": 0.07,
        "pct2022": 0.01,
        "variacao": -28,
        "varPct": -87.5
    },
    {
        "name": "JENIPAPO DOS VIEIRAS",
        "votes2018": 8,
        "votes2022": 4,
        "pct2018": 0.02,
        "pct2022": 0.01,
        "variacao": -4,
        "varPct": -50
    },
    {
        "name": "SÃO DOMINGOS DO AZEITÃO",
        "votes2018": 25,
        "votes2022": 4,
        "pct2018": 0.06,
        "pct2022": 0.01,
        "variacao": -21,
        "varPct": -84
    },
    {
        "name": "SANTA FILOMENA DO MARANHÃO",
        "votes2018": 16,
        "votes2022": 3,
        "pct2018": 0.04,
        "pct2022": 0.01,
        "variacao": -13,
        "varPct": -81.25
    },
    {
        "name": "MARACAÇUMÉ",
        "votes2018": 32,
        "votes2022": 3,
        "pct2018": 0.07,
        "pct2022": 0.01,
        "variacao": -29,
        "varPct": -90.625
    },
    {
        "name": "SUCUPIRA DO RIACHÃO",
        "votes2018": 21,
        "votes2022": 3,
        "pct2018": 0.05,
        "pct2022": 0.01,
        "variacao": -18,
        "varPct": -85.71428571428571
    },
    {
        "name": "ALTAMIRA DO MARANHÃO",
        "votes2018": 1,
        "votes2022": 3,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 2,
        "varPct": 200
    },
    {
        "name": "AMAPÁ DO MARANHÃO",
        "votes2018": 28,
        "votes2022": 3,
        "pct2018": 0.06,
        "pct2022": 0.01,
        "variacao": -25,
        "varPct": -89.28571428571429
    },
    {
        "name": "ARAGUANÃ",
        "votes2018": 9,
        "votes2022": 3,
        "pct2018": 0.02,
        "pct2022": 0.01,
        "variacao": -6,
        "varPct": -66.66666666666666
    },
    {
        "name": "ITINGA DO MARANHÃO",
        "votes2018": 1,
        "votes2022": 3,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 2,
        "varPct": 200
    },
    {
        "name": "CAPINZAL DO NORTE",
        "votes2018": 6,
        "votes2022": 3,
        "pct2018": 0.01,
        "pct2022": 0.01,
        "variacao": -3,
        "varPct": -50
    },
    {
        "name": "BENEDITO LEITE",
        "votes2018": 194,
        "votes2022": 3,
        "pct2018": 0.44,
        "pct2022": 0.01,
        "variacao": -191,
        "varPct": -98.4536082474227
    },
    {
        "name": "BOM LUGAR",
        "votes2018": 28,
        "votes2022": 3,
        "pct2018": 0.06,
        "pct2022": 0.01,
        "variacao": -25,
        "varPct": -89.28571428571429
    },
    {
        "name": "ALTO PARNAÍBA",
        "votes2018": 8,
        "votes2022": 2,
        "pct2018": 0.02,
        "pct2022": 0.01,
        "variacao": -6,
        "varPct": -75
    },
    {
        "name": "SÃO RAIMUNDO DO DOCA BEZERRA",
        "votes2018": 5,
        "votes2022": 2,
        "pct2018": 0.01,
        "pct2022": 0.01,
        "variacao": -3,
        "varPct": -60
    },
    {
        "name": "IGARAPÉ DO MEIO",
        "votes2018": 79,
        "votes2022": 2,
        "pct2018": 0.18,
        "pct2022": 0.01,
        "variacao": -77,
        "varPct": -97.46835443037975
    },
    {
        "name": "FEIRA NOVA DO MARANHÃO",
        "votes2018": 55,
        "votes2022": 2,
        "pct2018": 0.13,
        "pct2022": 0.01,
        "variacao": -53,
        "varPct": -96.36363636363636
    },
    {
        "name": "BERNARDO DO MEARIM",
        "votes2018": 2,
        "votes2022": 2,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 0,
        "varPct": 0
    },
    {
        "name": "ITAIPAVA DO GRAJAÚ",
        "votes2018": 29,
        "votes2022": 2,
        "pct2018": 0.07,
        "pct2022": 0.01,
        "variacao": -27,
        "varPct": -93.10344827586206
    },
    {
        "name": "JUNCO DO MARANHÃO",
        "votes2018": 78,
        "votes2022": 2,
        "pct2018": 0.18,
        "pct2022": 0.01,
        "variacao": -76,
        "varPct": -97.43589743589743
    },
    {
        "name": "SATUBINHA",
        "votes2018": 40,
        "votes2022": 2,
        "pct2018": 0.09,
        "pct2022": 0.01,
        "variacao": -38,
        "varPct": -95
    },
    {
        "name": "SÃO JOÃO DO PARAÍSO",
        "votes2018": 0,
        "votes2022": 2,
        "pct2018": 0,
        "pct2022": 0.01,
        "variacao": 2,
        "varPct": "inf"
    },
    {
        "name": "TUFILÂNDIA",
        "votes2018": 17,
        "votes2022": 2,
        "pct2018": 0.04,
        "pct2022": 0.01,
        "variacao": -15,
        "varPct": -88.23529411764706
    },
    {
        "name": "FORMOSA DA SERRA NEGRA",
        "votes2018": 2,
        "votes2022": 1,
        "pct2018": 0,
        "pct2022": 0,
        "variacao": -1,
        "varPct": -50
    },
    {
        "name": "LAJEADO NOVO",
        "votes2018": 0,
        "votes2022": 1,
        "pct2018": 0,
        "pct2022": 0,
        "variacao": 1,
        "varPct": "inf"
    },
    {
        "name": "MARAJÁ DO SENA",
        "votes2018": 27,
        "votes2022": 1,
        "pct2018": 0.06,
        "pct2022": 0,
        "variacao": -26,
        "varPct": -96.29629629629629
    },
    {
        "name": "PRESIDENTE SARNEY",
        "votes2018": 16,
        "votes2022": 1,
        "pct2018": 0.04,
        "pct2022": 0,
        "variacao": -15,
        "varPct": -93.75
    },
    {
        "name": "PRESIDENTE MÉDICI",
        "votes2018": 5,
        "votes2022": 1,
        "pct2018": 0.01,
        "pct2022": 0,
        "variacao": -4,
        "varPct": -80
    },
    {
        "name": "TASSO FRAGOSO",
        "votes2018": 6,
        "votes2022": 1,
        "pct2018": 0.01,
        "pct2022": 0,
        "variacao": -5,
        "varPct": -83.33333333333334
    },
    {
        "name": "SÃO PEDRO DOS CRENTES",
        "votes2018": 6,
        "votes2022": 0,
        "pct2018": 0.01,
        "pct2022": 0,
        "variacao": -6,
        "varPct": -100
    }
];
