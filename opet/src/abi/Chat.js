export const Chat = 
 {
  address: "0x5E776e886e9b99233345F62cDe0Ab6B5F01CE4CF",
  abi: [
    {
      type: "event",
      anonymous: false,
      name: "acceptContactEvent",
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
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "addContactEvent",
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
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "blockContactEvent",
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
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "messageSentEvent",
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
          type: "string",
          name: "message",
          indexed: false
        },
        {
          type: "bytes32",
          name: "encryption",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "profileUpdateEvent",
      inputs: [
        {
          type: "address",
          name: "from",
          indexed: true
        },
        {
          type: "bytes32",
          name: "name",
          indexed: false
        },
        {
          type: "bytes32",
          name: "avatarUrl",
          indexed: false
        }
      ]
    },
    {
      type: "event",
      anonymous: false,
      name: "unblockContactEvent",
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
        }
      ]
    },
    {
      type: "function",
      name: "acceptContactRequest",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "addr"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "addContact",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "addr"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "blockMessagesFrom",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "from"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "getRelationWith",
      constant: true,
      stateMutability: "view",
      payable: false,
      inputs: [
        {
          type: "address",
          name: "a"
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
      name: "join",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "bytes32",
          name: "publicKeyLeft"
        },
        {
          type: "bytes32",
          name: "publicKeyRight"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "members",
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
          name: "publicKeyLeft"
        },
        {
          type: "bytes32",
          name: "publicKeyRight"
        },
        {
          type: "bytes32",
          name: "name"
        },
        {
          type: "bytes32",
          name: "avatarUrl"
        },
        {
          type: "uint256",
          name: "messageStartBlock"
        },
        {
          type: "bool",
          name: "isMember"
        }
      ]
    },
    {
      type: "function",
      name: "sendMessage",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "to"
        },
        {
          type: "string",
          name: "message"
        },
        {
          type: "bytes32",
          name: "encryption"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "unblockMessagesFrom",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "address",
          name: "from"
        }
      ],
      outputs: []
    },
    {
      type: "function",
      name: "updateProfile",
      constant: false,
      payable: false,
      inputs: [
        {
          type: "bytes32",
          name: "name"
        },
        {
          type: "bytes32",
          name: "avatarUrl"
        }
      ],
      outputs: []
    }
  ]
}