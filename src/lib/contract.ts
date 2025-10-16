export const CYPHER_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const // TODO: Replace with actual deployed contract address
export const BASE_SEPOLIA_CHAIN_ID = 84532

export const CYPHER_ABI = [
  {
    type: "function",
    name: "FINALIZER_FEE_BPS",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_ATTEMPTS",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MIN_PLAYERS",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "USDC_TOKEN",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addKOL",
    inputs: [{ name: "kolHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimReward",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "currentGameId",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dailyPlayerData",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [
      { name: "attempts", type: "uint8" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dailyWinnings",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "finalizeGame",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "winners", type: "address[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isFinalized",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "startGame",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "guess", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitGuess",
    inputs: [{ name: "guess", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "GameStarted",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "GuessSubmitted",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "guess", type: "string" },
    ],
  },
  {
    type: "event",
    name: "GameFinalized",
    inputs: [{ name: "gameId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "RewardClaimed",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "amount", type: "uint256" },
    ],
  },
] as const
