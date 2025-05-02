export const Chainlink = 
 {
  address: "0x99310e0C3ec43B8312cbD35e038F6554ceC9cE8a",
  abi: [
    {
      type: "constructor",
      payable: false,
      inputs: []
    },
    {
      type: "function",
      name: "lastRandomResultsOf",
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
    },
    {
      type: "function",
      name: "lastRequestId",
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
          type: "bytes32"
        }
      ]
    },
    {
      type: "function",
      name: "lastUserRound",
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
          name: "requestId"
        },
        {
          type: "uint256",
          name: "randomResult"
        }
      ]
    },
    {
      type: "function",
      name: "randomResult",
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
      name: "randomResultsOf",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "bytes32",
          name: "requestId"
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
      name: "rawFulfillRandomness",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "bytes32",
          name: "requestId"
        },
        {
          type: "uint256",
          name: "randomness"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "requestRandomNumber",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: [
        {
          type: "bytes32",
          name: "requestId"
        }
      ]
    },
    {
      type: "function",
      name: "requestReference",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "bytes32"
        }
      ],
      outputs: [
        {
          type: "address",
          name: "userAddress"
        },
        {
          type: "uint256",
          name: "randomResult"
        }
      ]
    },
    {
      type: "function",
      name: "resetLastRandom",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "userAddress"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "userAddressesOf",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "bytes32",
          name: "requestId"
        }
      ],
      outputs: [
        {
          type: "address"
        }
      ]
    }
  ]
}