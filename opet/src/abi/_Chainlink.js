export const _Chainlink = 
 {
  address: "0x3DD195393582D54F79Cc3268E23e62eab0EB2b75",
  abi: [
    {
      type: "constructor",
      payable: false,
      inputs: []
    },
    {
      type: "function",
      name: "randomResults",
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
          name: "userSeed"
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
      name: "requestRandomNumber",
      constant: false,
      payable: false,
      inputs: [],
      outputs: [
        {
          type: "bytes32",
          name: "requestId"
        }
      ]
    },
    {
      type: "function",
      name: "setRequestId",
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
      name: "userAddresses",
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
          type: "address"
        }
      ]
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
          name: "userSeed"
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