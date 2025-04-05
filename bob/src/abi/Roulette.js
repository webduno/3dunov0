export const Roulette =
{
  address: "0x795bE958CeDfF49A37861b82c150ed728d993771",
  abi: [
    {
      type: "constructor",
      payable: false,
      inputs: []
    },
    {
      type: "event",
      anonymous: false,
      name: "NewEarlyRequest",
      inputs: [
        {
          type: "address",
          name: "user",
          indexed: true
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "NewGameRequest",
      inputs: [
        {
          type: "address",
          name: "user",
          indexed: true
        }
      ]
    },
    {
      type: "function",
      name: "BULK_MULTIPLIER",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "OpenPet",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "ROULETTE_NUMBER_COUNT",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "TIMEOUT_FOR_MASTER_REVEAL",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "WIN_MULTIPLIER",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "betBulk",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint8",
          name: "bulkOption"
        },
        {
          type: "uint256",
          name: "userRandom"
        },
        {
          type: "uint256",
          name: "betAmount"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "dripAmount",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "fee",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "uint8"
        }
      ]
    },
    {
      type: "function",
      name: "feeTo",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "feeToSetter",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "gameRounds",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address"
        }
      ],
      outputs: [
        {
          type: "bytes32",
          name: "masterRandomHash"
        },
        {
          type: "uint256",
          name: "masterRandom"
        },
        {
          type: "uint256",
          name: "userRandom"
        },
        {
          type: "uint256",
          name: "lockedFunds"
        },
        {
          type: "uint256",
          name: "highestBetAmount"
        },
        {
          type: "uint256",
          name: "masterLockedFunds"
        },
        {
          type: "uint256",
          name: "initHashTimestamp"
        },
        {
          type: "uint8",
          name: "lastResult"
        },
        {
          type: "uint256",
          name: "wonAmount"
        },
        {
          type: "uint256",
          name: "petTokenId"
        },
        {
          type: "bool",
          name: "redeemed"
        }
      ]
    },
    {
      type: "function",
      name: "getMasterAddress",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "hasRequestedEarly",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ]
    },
    {
      type: "function",
      name: "hasRequestedGame",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ]
    },
    {
      type: "function",
      name: "increaseFunds",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "amount"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "initializeGame",
      constant: false,
      payable: false,
      inputs: [],
      outputs: []
    },
    {
      type: "function",
      name: "lastResultOf",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: [
        {
          type: "uint8"
        }
      ]
    },
    {
      type: "function",
      name: "lastUserNumbers",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: [
        {
          type: "uint256[37]"
        }
      ]
    },
    {
      type: "function",
      name: "masterAddress",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "placeBet",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint8",
          name: "userNumber"
        },
        {
          type: "uint256",
          name: "userRandom"
        },
        {
          type: "uint256",
          name: "betAmount"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "quoteERC20",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "quoteERC202",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "reRegister",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ]
    },
    {
      type: "function",
      name: "recoverLockedFunds",
      constant: false,
      payable: false,
      inputs: [],
      outputs: []
    },
    {
      type: "function",
      name: "redeemPrize",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "petTokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "redeemSpecialPrize",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "petTokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "registeredFunds",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address"
        }
      ],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "removeBet",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint8",
          name: "userNumber"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "requestResult",
      constant: false,
      payable: false,
      inputs: [],
      outputs: []
    },
    {
      type: "function",
      name: "resolveBet",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "masterRandom"
        },
        {
          type: "bytes32",
          name: "newMasterRandomHash"
        },
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "sendFunds",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "addressTo"
        },
        {
          type: "uint256",
          name: "amount"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setFaucetDripAmount",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "_dripAmount"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setFee",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint8",
          name: "_fee"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setFeeToSetter",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "newSetter"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setInitHash",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "bytes32",
          name: "masterRandomHash"
        },
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setReRegister",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "bool",
          name: "_reRegister"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "userNumbers",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: [
        {
          type: "uint256[37]"
        }
      ]
    },
    {
      type: "function",
      name: "withdrawFunds",
      constant: false,
      payable: false,
      inputs: [],
      outputs: []
    },
    {
      type: "function",
      name: "wonAmountOf",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: [
        {
          type: "uint256"
        }
      ]
    }
  ]
}