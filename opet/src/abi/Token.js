export const Token = 
 {
  address: "0x4F3020D0932258ABFe8074AC92a93A4852626dfb",
  abi: [
    {
      type: "constructor",
      payable: false,
      inputs: []
    },
    {
      type: "event",
      anonymous: false,
      name: "Approval",
      inputs: [
        {
          type: "address",
          name: "owner",
          indexed: true
        },
        {
          type: "address",
          name: "spender",
          indexed: true
        },
        {
          type: "uint256",
          name: "value",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "MinTokensBeforeSwapUpdated",
      inputs: [
        {
          type: "uint256",
          name: "minTokensBeforeSwap",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "OwnershipTransferred",
      inputs: [
        {
          type: "address",
          name: "previousOwner",
          indexed: true
        },
        {
          type: "address",
          name: "newOwner",
          indexed: true
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "SwapAndLiquify",
      inputs: [
        {
          type: "uint256",
          name: "tokensSwapped",
          indexed: false
        },
        {
          type: "uint256",
          name: "ethReceived",
          indexed: false
        },
        {
          type: "uint256",
          name: "tokensIntoLiqudity",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "SwapAndLiquifyEnabledUpdated",
      inputs: [
        {
          type: "bool",
          name: "enabled",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "Transfer",
      inputs: [
        {
          type: "address",
          name: "from",
          indexed: true
        },
        {
          type: "address",
          name: "to",
          indexed: true
        },
        {
          type: "uint256",
          name: "value",
          indexed: false
        }
      ]
    },
    {
      type: "function",
      name: "_liquidityFee",
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
      name: "_maxTxAmount",
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
      name: "_taxFee",
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
      name: "allowance",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "owner"
        },
        {
          type: "address",
          name: "spender"
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
      name: "approve",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "spender"
        },
        {
          type: "uint256",
          name: "amount"
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
      name: "balanceOf",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
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
      name: "calculateLiquidityFee",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "_amount"
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
      name: "calculateTaxFee",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "_amount"
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
      name: "decimals",
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
      name: "decreaseAllAllowance",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "spender"
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
      name: "decreaseAllowance",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "spender"
        },
        {
          type: "uint256",
          name: "subtractedValue"
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
      name: "deliver",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tAmount"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "excludeFromFee",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "excludeFromReward",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "geUnlockTime",
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
      name: "includeInFee",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "includeInReward",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "increaseAllowance",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "spender"
        },
        {
          type: "uint256",
          name: "addedValue"
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
      name: "isExcludedFromFee",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
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
      name: "isExcludedFromReward",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "account"
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
      name: "lock",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "time"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "name",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "string"
        }
      ]
    },
    {
      type: "function",
      name: "owner",
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
      name: "reflectionFromToken",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tAmount"
        },
        {
          type: "bool",
          name: "deductTransferFee"
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
      name: "renounceOwnership",
      constant: false,
      payable: false,
      inputs: [],
      outputs: []
    },
    {
      type: "function",
      name: "setLiquidityFeePercent",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "liquidityFee"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setMaxTxPercent",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "maxTxPercent"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setSwapAndLiquifyEnabled",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "bool",
          name: "_enabled"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setTaxFeePercent",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "taxFee"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setUniswapV2ForkRouterAddress",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "_uniswapV2ForkRouterAddress"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "swapAndLiquifyEnabled",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "bool"
        }
      ]
    },
    {
      type: "function",
      name: "symbol",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "string"
        }
      ]
    },
    {
      type: "function",
      name: "tokenFromReflection",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "rAmount"
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
      name: "totalFees",
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
      name: "totalSupply",
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
      name: "transfer",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "recipient"
        },
        {
          type: "uint256",
          name: "amount"
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
      name: "transferFrom",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "sender"
        },
        {
          type: "address",
          name: "recipient"
        },
        {
          type: "uint256",
          name: "amount"
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
      name: "transferOwnership",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "newOwner"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "uniswapV2ForkPair",
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
      name: "uniswapV2ForkRouter",
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
      name: "unlock",
      constant: false,
      payable: false,
      inputs: [],
      outputs: []
    }
  ]
}