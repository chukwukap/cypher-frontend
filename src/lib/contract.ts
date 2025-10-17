export const CYPHER_CONTRACT_ADDRESS =
  "0x4AF112f326638ff9f0A5564443b645F08c4eC163" as const; // TODO: Replace with actual deployed contract address
export const BASE_SEPOLIA_CHAIN_ID = 84532;

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
    name: "kolCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "kolHashes",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ type: "bytes32" }],
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
    inputs: [{ name: "_kolHash", type: "bytes32" }],
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
      { name: "status", type: "uint8" },
      { name: "assignedKOLHash", type: "bytes32" },
      { name: "depositAmount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "attempts", type: "uint256" },
      { name: "finalScore", type: "uint256" },
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
      { name: "allPlayers", type: "address[]" },
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
    inputs: [{ name: "_usdcAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitGuess",
    inputs: [{ name: "_guess", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "GameStarted",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "assignedKOLHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GuessSubmitted",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "attempts", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "GameFinalized",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "prizePool", type: "uint256", indexed: false },
      { name: "finalizer", type: "address", indexed: false },
    ],
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
] as const;
