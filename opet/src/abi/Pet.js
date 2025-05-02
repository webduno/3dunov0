export const Pet = 
 {
  address: "0xE4cadF838d51c5bcdb5A9cCF9fe8B7d966E09bC4",
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
          name: "approved",
          indexed: true
        },
        {
          type: "uint256",
          name: "tokenId",
          indexed: true
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "ApprovalForAll",
      inputs: [
        {
          type: "address",
          name: "owner",
          indexed: true
        },
        {
          type: "address",
          name: "operator",
          indexed: true
        },
        {
          type: "bool",
          name: "approved",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "NewPet",
      inputs: [
        {
          type: "uint256",
          name: "tokenId",
          indexed: false
        },
        {
          type: "address",
          name: "userAddress",
          indexed: true
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "OverduePetting",
      inputs: [
        {
          type: "uint256",
          name: "tokenId",
          indexed: false
        },
        {
          type: "address",
          name: "userAddress",
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
          name: "tokenId",
          indexed: true
        }
      ]
    },
    {
      type: "function",
      name: "INHERITANCE_MULTIPLIERS",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256"
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
      name: "OpenPets",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256"
        }
      ],
      outputs: [
        {
          type: "uint256",
          name: "id"
        },
        {
          type: "uint256",
          name: "adoptTime"
        },
        {
          type: "uint8",
          name: "number"
        },
        {
          type: "bytes32",
          name: "genes"
        },
        {
          type: "uint256",
          name: "inheritance"
        },
        {
          type: "uint256",
          name: "life"
        },
        {
          type: "string",
          name: "name"
        },
        {
          type: "string",
          name: "uri"
        },
        {
          type: "bool",
          name: "redeemed"
        },
        {
          type: "uint256",
          name: "pettedTimestamp"
        }
      ]
    },
    {
      type: "function",
      name: "PETTING_TIMEOUTS",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256"
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
      name: "PET_NAMES",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256"
        }
      ],
      outputs: [
        {
          type: "string"
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
          name: "to"
        },
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: []
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
          name: "owner"
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
      name: "createPet",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        },
        {
          type: "bytes32",
          name: "genes"
        },
        {
          type: "string",
          name: "name"
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
      name: "getApproved",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "getInheritance",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
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
      name: "getLifeList",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: [
        {
          type: "uint256[11]"
        }
      ]
    },
    {
      type: "function",
      name: "getTokenNumber",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
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
      name: "isApprovedForAll",
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
          name: "operator"
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
      name: "isRedeemable",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
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
      name: "overduePetting",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        },
        {
          type: "uint256",
          name: "ownTokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "ownerOf",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: [
        {
          type: "address"
        }
      ]
    },
    {
      type: "function",
      name: "petAPet",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "safeTransferFrom",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "from"
        },
        {
          type: "address",
          name: "to"
        },
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "safeTransferFrom",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "from"
        },
        {
          type: "address",
          name: "to"
        },
        {
          type: "uint256",
          name: "tokenId"
        },
        {
          type: "bytes",
          name: "_data"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "searchLife",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        },
        {
          type: "uint8",
          name: "spot"
        },
        {
          type: "uint256",
          name: "ownTokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setApprovalForAll",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "operator"
        },
        {
          type: "bool",
          name: "approved"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setRedemeed",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "setTokenURI",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        },
        {
          type: "string",
          name: "_tokenURI"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "supportsInterface",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "bytes4",
          name: "interfaceId"
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
      name: "tokenURI",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: [
        {
          type: "string"
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
          name: "from"
        },
        {
          type: "address",
          name: "to"
        },
        {
          type: "uint256",
          name: "tokenId"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "useLifePercent",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "tokenId"
        },
        {
          type: "uint8",
          name: "percent"
        }
      ],
      outputs: []
    }
  ]
}