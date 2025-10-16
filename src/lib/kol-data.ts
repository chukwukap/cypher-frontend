import type { KOL } from "./types"
import { keccak256, toBytes } from "viem"

function generateKOLId(name: string): `0x${string}` {
  return keccak256(toBytes(name))
}

export const MOCK_KOLS: KOL[] = [
  {
    id: generateKOLId("Jesse Pollak"),
    name: "Jesse Pollak",
    twitterHandle: "@jessepollak",
    attributes: {
      association: "Base",
      ecosystem: "Base",
      pfpTheme: "Human",
      followers: 250000,
      age: 35,
    },
  },
  {
    id: generateKOLId("Brian Armstrong"),
    name: "Brian Armstrong",
    twitterHandle: "@brian_armstrong",
    attributes: {
      association: "Coinbase",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 1200000,
      age: 41,
    },
  },
  {
    id: generateKOLId("Vitalik Buterin"),
    name: "Vitalik Buterin",
    twitterHandle: "@VitalikButerin",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 5000000,
      age: 30,
    },
  },
  {
    id: generateKOLId("Anatoly Yakovenko"),
    name: "Anatoly Yakovenko",
    twitterHandle: "@aeyakovenko",
    attributes: {
      association: "Other",
      ecosystem: "Solana",
      pfpTheme: "Human",
      followers: 450000,
      age: 42,
    },
  },
  {
    id: generateKOLId("Balaji Srinivasan"),
    name: "Balaji Srinivasan",
    twitterHandle: "@balajis",
    attributes: {
      association: "a16z",
      ecosystem: "Cross-Chain",
      pfpTheme: "Human",
      followers: 800000,
      age: 43,
    },
  },
]

// In production, fetch from Edge Config
export async function fetchKOLs(): Promise<KOL[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_KOLS
}

// Get a random target KOL for the day (in production, this would be deterministic based on gameId)
export function getTodayTarget(): KOL {
  return MOCK_KOLS[0] // Jesse Pollak for demo
}
