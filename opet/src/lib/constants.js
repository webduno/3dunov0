import {Token}            from '../abi/Token.js';
import {Token2}            from '../abi/Token2.js';
import {Pet}            from '../abi/Pet.js';
import {Chat}            from '../abi/Chat.js';
import {Roulette}         from '../abi/Roulette.js';
import {Roulette2}         from '../abi/Roulette2.js';
import {ZooIslands}         from '../abi/ZooIslands.js';

export const CONSTANTS = {
    defaultNetwork: "matic",

    defaultScanName: "Polygonscan",
    baseURL: "https://webduno..com/opet/petroulette",
    defaultRouletteLink: "https://webduno..com/opet/",
    
    revertedList: {
        "REQUEST_EXISTS":                      "Already requested init random hash",
        "EARLY_REQUEST_EXISTS":                "Already requested early solve",
        "BET_NOT_SET":                         "No bets found",
        "MASTER_HASH_NOT_SET":                 "Initial random hash has not been set",
        "BET_COLOR_FIRST_ONLY":                "Betting on color has to be the first in the bet",
        "INVALID_USER_RANDOM":                 "User random is invalid",
        "BET_NUMBER_EXISTS":                   "The bet already exists",
        "INSUFFICIENT_MASTER_FUNDS":           "Master has not enough funds",
        "INSUFFICIENT_USER_FUNDS":             "User has not enough funds",
        "INVALID_AMOUNT":                      "Invalid amount",
        "INVALID_ADDRESS":                     "Invalid address",
        "ERC20_TRANSFER_FAILED":               "TREAT transfer failed",
        "INSUFFICIENT_BALANCE":                "User has not enough balance",
        "TIMEOUT_NOT_REACHED":                 "The bet timeout has not been reached",
        "INSUFFICIENT_BET_AMOUNT":             "The bet amount is lower than the minimun allowed",
        "CANT_REMOVE_ALL":                     "Can't remove all pets from the round",
        "ALREADY_SEARCHED":                    "Can't search an already searched spot",
        // MASTER ONLY
        "ALREADY_REVEALED":                    "ALREADY_REVEALED",
        "MASTER_RANDOM_NOT_MATCH":             "MASTER_RANDOM_NOT_MATCH",
        "MASTER_HASH_EXISTS":                  "MASTER_HASH_EXISTS",
        "INVALID_BULK_OPTION":                 "INVALID_BULK_OPTION",

        // CALL_EXCEPTION
    },
    chainInfoReference: {
        ".1337": "localhost",
        ".1": "eth",

        ".4002": "ftm.test",
        ".250": "ftm",
        ".137": "matic",
        ".42": "kovan",
        ".56": "bsc",
        ".43113": "avalanche",
    },
    chainInfo: {
        "localhost": {
            enabled: false,
            endpoint: ".localhost/",
            symbol: "eth",
            name: 'LOCALHOST',
            params: {
                chainId: "0xfa2", // 4002
                chainName: 'Localhost',
                nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://127.0.0.1:8545'],
                blockExplorerUrls: ['https://www.google.com/search?q=']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "ftm.test": {
            enabled: false,
            endpoint: ".ftm.test/",
            symbol: "ftm",
            name: 'Fantom Testnet',
            params: {
                chainId: "0xfa2", // 4002
                chainName: 'Fantom.test',
                nativeCurrency: {
                    name: 'Fantom',
                    symbol: 'FTM',
                    decimals: 18
                },
                rpcUrls: ['https://rpc.testnet.fantom.network'],
                blockExplorerUrls: ['https://testnet.ftmscan.com']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "ftm": {
            enabled: true,
            endpoint: ".ftm/",
            symbol: "ftm",
            name: 'Fantom Opera',
            params: {
                chainId: "0xfa", // 250
                chainName: 'Fantom',
                nativeCurrency: {
                    name: 'Fantom',
                    symbol: 'FTM',
                    decimals: 18
                },
                rpcUrls: ['https://rpcapi.fantom.network'],
                blockExplorerUrls: ['https://ftmscan.com']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "matic": {
            enabled: true,
            endpoint: ".matic/",
            symbol: "matic",
            name: 'Matic Mainnet',
            params: {
                chainId: "0x89", // 137
                chainName: 'Matic',
                nativeCurrency: {
                    name: 'Matic',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://rpc-mainnet.maticvigil.com'],
                blockExplorerUrls: ['https://polygonscan.com']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "kovan": {
            enabled: true,
            endpoint: ".kovan/",
            symbol: "eth",
            name: 'Kovan Testnet',
            params: {
                chainId: '0x2a', // 42
                chainName: 'Kovan',
                nativeCurrency: {
                    name: 'Kovan ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                blockExplorerUrls: ['https://kovan.etherscan.io']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "eth": {
            enabled: true,
            endpoint: ".eth/",
            symbol: "eth",
            name: 'Eth Mainnet',
            params: {
                chainId: '0x01', // 1
                chainName: 'Ethereum',
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: [''],
                blockExplorerUrls: ['https://etherscan.io']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "homestead": {
            enabled: false,
            endpoint: ".eth/",
            symbol: "eth",
            name: 'Eth Mainnet',
            params: {
                chainId: '0x01', // 42
                chainName: 'Ethereum',
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: [''],
                blockExplorerUrls: ['https://etherscan.io']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "avalanche": {
            enabled: false,
            endpoint: ".avax/",
            symbol: "avax",
            name: 'Avax Testnet (C)',
            params: {
                chainId: '0xA869', //43113
                chainName: 'Avax Testnet (C)',
                nativeCurrency: {
                    name: 'Avalanche',
                    symbol: 'AVAX',
                    decimals: 18
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://cchain.explorer.avax-test.network']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "bsc": {
            enabled: false,
            endpoint: ".bsc.test/",
            symbol: "bnb",
            name: "BSC Mainnet",
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
        "bsc.test": {
            enabled: true,
            endpoint: ".bsc.test/",
            symbol: "bsc",
            name: 'BSC Testnet',
            params: {
                chainId: "0x61", // 97
                chainName: 'BSC.test',
                nativeCurrency: {
                    name: 'Binance Coin',
                    symbol: 'BNB',
                    decimals: 18
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                blockExplorerUrls: ['https://testnet.bscscan.com']
            },
            tokenAddress: Token.address,
            token2Address: Token2.address,
            petAddress: Pet.address,
            chatAddress: Chat.address,
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
    },
    isNumberRedArray: [
        true,
        true,
        false,
        true,
        false,
        false,
        true,
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        false,
        true,
        true,
        true
    ],

    // TYPES
    // Reptile
    // Sea Mammal
    // Earth Mammal
    // Mollusc
    // Amphibian
    // Bird
    // Fish
    // Arthropod

    pets: {
        '0':  {id:'0', icon:"👽",name:       "Alien"             ,multiplier: 11,timeout: 24}, /* "Alien" */            //     Reptile              
        '1':  {id:'1', icon:"🐬",name:       "Dolphin"           ,multiplier: 2,timeout:  5}, /* "Delfín" */           //     Sea Mammal              
        '2':  {id:'2', icon:"🐮",name:       "Bull"              ,multiplier: 7,timeout:  8}, /* "Toro" */             //     Earth Mammal              
        '3':  {id:'3', icon:"🐌",name:       "Snail"             ,multiplier: 11,timeout: 24}, /* "Caracol" */          //     Mollusc              
        '4':  {id:'4', icon:"🦖",name:       "Dinosaur"          ,multiplier: 5,timeout:  6}, /* "Dinosaurio" */       //     Reptile              
        '5':  {id:'5', icon:"🐝",name:       "Bee"               ,multiplier: 13,timeout: 24}, /* "Aveja" */            //     Arthropod              
        '6':  {id:'6', icon:"🐸",name:       "Frog"              ,multiplier: 2,timeout: 12}, /* "Rana" */             //     Amphibian              
        '7':  {id:'7', icon:"🐢",name:       "Turtle"            ,multiplier: 3,timeout:  5}, /* "Tortuga" */          //     Reptile              
        '8':  {id:'8', icon:"🦍",name:       "Gorilla"           ,multiplier: 7,timeout: 14}, /* "Gorila" */           //     Earth Mammal              
        '9':  {id:'9', icon:"🐦",name:       "Bird"              ,multiplier: 4,timeout:  9}, /* "Pajaro" */           //     Bird              
        '10': {id:'10',icon:"🐼",name:       "Panda"             ,multiplier: 4,timeout: 10}, /* "Panda" */            //     Earth Mammal              
        '11': {id:'11',icon:"🐈",name:       "Cat"               ,multiplier: 6,timeout: 18}, /* "Gato" */             //     Earth Mammal              
        '12': {id:'12',icon:"🦑",name:       "Axolotl"           ,multiplier: 5,timeout:  5}, /* "Axolotl" */          //     Fish              
        '13': {id:'13',icon:"🐒",name:       "Monkey"            ,multiplier: 3,timeout: 10}, /* "Mono" */             //     Earth Mammal              
        '14': {id:'14',icon:"🐧",name:       "Penguin"           ,multiplier: 11,timeout: 19}, /* "Pingüino" */         //     Sea Mammal              
        '15': {id:'15',icon:"🐺",name:       "Fox"               ,multiplier: 6,timeout: 10}, /* "Zorro" */            //     Earth Mammal              
        '16': {id:'16',icon:"🐻",name:       "Bear"              ,multiplier: 49,timeout:168}, /* "Oso" */              //     Earth Mammal              
        '17': {id:'17',icon:"🦇",name:       "Bat"               ,multiplier: 16,timeout: 21}, /* "Murcielago" */       //     Earth Mammal              
        '18': {id:'18',icon:"🐴",name:       "Horse"             ,multiplier: 2,timeout:  4}, /* "Caballo" */          //     Earth Mammal              
        '19': {id:'19',icon:"🦎",name:       "Salamander"        ,multiplier: 4,timeout:  6}, /* "Salamander" */       //     Amphibian              
        '20': {id:'20',icon:"🐖",name:       "Pig"               ,multiplier: 5,timeout: 11}, /* "Cochino" */          //     Earth Mammal              
        '21': {id:'21',icon:"🕷",name:       "Spider"            ,multiplier: 3,timeout:  6}, /* "Araña" */            //     Arthropod              
        '22': {id:'22',icon:"🐪",name:       "Camel"             ,multiplier: 5,timeout:  6}, /* "Camello" */          //     Earth Mammal              
        '23': {id:'23',icon:"🦂",name:       "Scorpion"          ,multiplier: 9,timeout: 10}, /* "Escorpion" */        //     Arthropod
        '24': {id:'24',icon:"🐉",name:       "Dragon"            ,multiplier: 48,timeout: 72}, /* "Dragon" */           //     Reptile              
        '25': {id:'25',icon:"🦜",name:       "Parrot"            ,multiplier: 9,timeout: 14}, /* "Guacamaya" */        //     Bird              
        '26': {id:'26',icon:"🐏",name:       "Ram"               ,multiplier: 2,timeout:  4}, /* "Carnero" */          //     Earth Mammal              
        '27': {id:'27',icon:"🐕",name:       "Dog"               ,multiplier: 5,timeout: 13}, /* "Perro" */            //     Earth Mammal              
    /*🦩*/'28': {id:'28',icon:"🦩",name:      "Flamingo"          ,multiplier: 4,timeout:  6}, /* "Flamingo" */         //     Bird              
        '29': {id:'29',icon:"🐘",name:       "Elephant"          ,multiplier: 3,timeout:  4}, /* "Elefante" */         //     Earth Mammal              
        '30': {id:'30',icon:"🦈",name:       "Shark"             ,multiplier: 2,timeout:  4}, /* "Tiburon" */          //     Fish              
        '31': {id:'31',icon:"🐁",name:       "Mouse"             ,multiplier: 5,timeout: 15}, /* "Ratón" */            //     Earth Mammal              
        '32': {id:'32',icon:"🐺",name:       "Wolf"              ,multiplier: 5,timeout:  6}, /* "Lobo" */             //     Earth Mammal              
        '33': {id:'33',icon:"🐟",name:       "Fish"              ,multiplier: 4,timeout: 11}, /* "Pescado" */          //     Fish              
        '34': {id:'34',icon:"🐙",name:       "Octopus"           ,multiplier: 5,timeout:  6}, /* "Pulpo" */            //     Mollusc              
        '35': {id:'35',icon:"🦒",name:       "Giraffe"           ,multiplier: 4,timeout:  4}, /* "Jirafa" */           //     Earth Mammal              
        '36': {id:'36',icon:"🐍",name:       "Snake"             ,multiplier: 3,timeout:  4}, /* "Culebra" */          //     Reptile              
        // '37': {id:'37',icon:"🐋",name:       "Whale"           multiplier: ,  }, /* "Ballena" */          /**/
    },

    petList: [
        "Alien", "Dolphin", "Bull", "Snail", "Dinosaur", "Bee", "Frog", "Turtle", "Gorilla", "Bird",
        "Panda", "Cat", "Axolotl", "Monkey", "Penguin", "Fox", "Bear", "Bat", "Horse", "Salamander",
        "Pig", "Spider", "Camel", "Scorpion", "Dragon", "Parrot", "Ram", "Dog", "Flamingo", "Elephant",
        "Shark", "Mouse", "Wolf", "Fish", "Octopus", "Giraffe", "Snake",
        // "Whale"
        ],
};