export interface KOL {
  id: `0x${string}`; // keccak256 hash of the full name
  name: string;
  imageUrl?: string; // absolute or public path
  link?: string; // external profile URL
  twitterHandle: string;
  attributes: {
    association:
      | "Base"
      | "Coinbase"
      | "Optimism"
      | "Paradigm"
      | "a16z"
      | "Artist"
      | "Other";
    ecosystem: "Ethereum" | "Solana" | "Base" | "Cross-Chain";
    pfpTheme: "Animal" | "Abstract" | "Human" | "Pixel Art" | "None";
    followers: number;
    age: number;
  };
}

export type PlayerStatus = "EMPTY" | "ACTIVE" | "COMPLETED" | "FAILED";

export type HintType = "correct" | "close" | "wrong";

export interface Hint {
  attribute: keyof KOL["attributes"];
  type: HintType;
  direction?: "higher" | "lower"; // For numerical attributes
}

export interface GuessWithHints {
  guess: KOL;
  hints: Hint[];
}

export interface PlayerData {
  attempts: number;
  status: number; // 0 = EMPTY, 1 = ACTIVE, 2 = COMPLETED, 3 = FAILED
}
