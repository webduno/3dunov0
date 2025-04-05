import {Token}            from '../abi/Token.js';
import {Token2}            from '../abi/Token2.js';
import {Pet}            from '../abi/Pet.js';
import {Roulette}         from '../abi/Roulette.js';
import {Roulette2}         from '../abi/Roulette2.js';
import {ZooIslands}         from '../abi/ZooIslands.js';

export const CONSTANTS = {
    defaultNetwork: "localhost",

    defaultScanName: "Polygonscan",
    baseURL: "https://duno.altervista.org/openpet/roulette",
    defaultRouletteLink: "http://localhost:3000/",
    
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
            rouletteAddress: Roulette.address,
            roulette2Address: Roulette2.address,
            zooIslandsAddress: ZooIslands.address,
        },
    },
    isNumberRedArray: [
        false, true,
        false, true,
        false, true,
        false, true,
        false, true,
        false, true,
        false,
        false, true,
        false, true,
        false, true,
        false, true,
        false, true,
        false, true,
        true,
        false, true,
        false, true,
        false, true,
        false, true,
        false, true,
        false, true
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
        '0':  {id:'0', icon:"👽",name:       "Alien"             }, /* "Alien" */            //     Reptile              
        '1':  {id:'1', icon:"🐬",name:       "Dolphin"           }, /* "Delfín" */           //     Sea Mammal              
        '2':  {id:'2', icon:"🐮",name:       "Bull"              }, /* "Toro" */             //     Earth Mammal              
        '3':  {id:'3', icon:"🐌",name:       "Snail"             }, /* "Caracol" */          //     Mollusc              
        '4':  {id:'4', icon:"🦖",name:       "Dinosaur"          }, /* "Dinosaurio" */       //     Reptile              
        '5':  {id:'5', icon:"🐝",name:       "Bee"               }, /* "Aveja" */            //     Arthropod              
        '6':  {id:'6', icon:"🐸",name:       "Frog"              }, /* "Rana" */             //     Amphibian              
        '7':  {id:'7', icon:"🐢",name:       "Turtle"            }, /* "Tortuga" */          //     Reptile              
        '8':  {id:'8', icon:"🦍",name:       "Gorilla"           }, /* "Gorila" */           //     Earth Mammal              
        '9':  {id:'9', icon:"🐦",name:       "Bird"              }, /* "Pajaro" */           //     Bird              
        '10': {id:'10',icon:"🐼",name:       "Panda"             }, /* "Panda" */            //     Earth Mammal              
        '11': {id:'11',icon:"🐈",name:       "Cat"               }, /* "Gato" */             //     Earth Mammal              
        '12': {id:'12',icon:"🦑",name:       "Axolotl"           }, /* "Axolotl" */          //     Fish              
        '13': {id:'13',icon:"🐒",name:       "Monkey"            }, /* "Mono" */             //     Earth Mammal              
        '14': {id:'14',icon:"🐧",name:       "Penguin"           }, /* "Pingüino" */         //     Sea Mammal              
        '15': {id:'15',icon:"🐺",name:       "Fox"               }, /* "Zorro" */            //     Earth Mammal              
        '16': {id:'16',icon:"🐻",name:       "Bear"              }, /* "Oso" */              //     Earth Mammal              
        '17': {id:'17',icon:"🦇",name:       "Bat"               }, /* "Murcielago" */       //     Earth Mammal              
        '18': {id:'18',icon:"🐴",name:       "Horse"             }, /* "Caballo" */          //     Earth Mammal              
        '19': {id:'19',icon:"🦎",name:       "Salamander"        }, /* "Salamander" */       //     Amphibian              
        '20': {id:'20',icon:"🐖",name:       "Pig"               }, /* "Cochino" */          //     Earth Mammal              
        '21': {id:'21',icon:"🕷",name:       "Spider"            }, /* "Araña" */            //     Arthropod              
        '22': {id:'22',icon:"🐪",name:       "Camel"             }, /* "Camello" */          //     Earth Mammal              
        '23': {id:'23',icon:"🦂",name:       "Scorpion"          }, /* "Escorpion" */        //     Arthropod
        '24': {id:'24',icon:"🐉",name:       "Dragon"            }, /* "Dragon" */           //     Reptile              
        '25': {id:'25',icon:"🦜",name:       "Parrot"            }, /* "Guacamaya" */        //     Bird              
        '26': {id:'26',icon:"🐏",name:       "Ram"               }, /* "Carnero" */          //     Earth Mammal              
        '27': {id:'27',icon:"🐕",name:       "Dog"               }, /* "Perro" */            //     Earth Mammal              
    /*🦩*/'28': {id:'28',icon:"🦩",name:      "Flamingo"          }, /* "Flamingo" */         //     Bird              
        '29': {id:'29',icon:"🐘",name:       "Elephant"          }, /* "Elefante" */         //     Earth Mammal              
        '30': {id:'30',icon:"🦈",name:       "Shark"             }, /* "Tiburon" */          //     Fish              
        '31': {id:'31',icon:"🐁",name:       "Mouse"             }, /* "Ratón" */            //     Earth Mammal              
        '32': {id:'32',icon:"🐺",name:       "Wolf"              }, /* "Lobo" */             //     Earth Mammal              
        '33': {id:'33',icon:"🐟",name:       "Fish"              }, /* "Pescado" */          //     Fish              
        '34': {id:'34',icon:"🐙",name:       "Octopus"           }, /* "Pulpo" */            //     Mollusc              
        '35': {id:'35',icon:"🦒",name:       "Giraffe"           }, /* "Jirafa" */           //     Earth Mammal              
        '36': {id:'36',icon:"🐍",name:       "Snake"             }, /* "Culebra" */          //     Reptile              
        // '37': {id:'37',icon:"🐋",name:       "Whale"             }, /* "Ballena" */          /**/
    },
    petList: [
        "Alien", "Dolphin", "Bull", "Snail", "Dinosaur", "Bee", "Frog", "Turtle", "Gorilla", "Bird",
        "Panda", "Cat", "Axolotl", "Monkey", "Penguin", "Fox", "Bear", "Bat", "Horse", "Salamander",
        "Pig", "Spider", "Camel", "Scorpion", "Dragon", "Parrot", "Ram", "Dog", "Flamingo", "Elephant",
        "Shark", "Mouse", "Wolf", "Fish", "Octopus", "Giraffe", "Snake",
        // "Whale"
        ],
};