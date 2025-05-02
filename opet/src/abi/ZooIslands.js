export const ZooIslands = 
 {
  address: "0xD653579f31D848ECE1eFBdb0e6549a188a8cE20f",
  abi: [
    {
      type: "constructor",
      payable: false,
      inputs: []
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
      name: "clearFriendSlot",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint8",
          name: "spot"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "clearPetSlot",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint8",
          name: "petNumber"
        }
      ],
      outputs: []
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
      name: "getRegisteredPets",
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
      name: "redeemLife",
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
    },
    {
      type: "function",
      name: "registerFriend",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "uint256",
          name: "friendTokenId"
        },
        {
          type: "uint8",
          name: "spot"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "registerPet",
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
      name: "userIslands",
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
          type: "uint256",
          name: "enterTimestamp"
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
    }
  ]
}