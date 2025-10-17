---
# Cypher - The On-Chain Gauntlet

A daily on-chain word game to test your knowledge of crypto's Key Opinion Leaders (KOLs), built on **Base** with a next-generation user experience.
---

## ✨ Core Features

- **Daily Randomized Puzzles:** Each player is assigned a unique, random KOL puzzle every day, making the game endlessly replayable and resistant to cheating.
- **Zero-Prompt & Gasless Gameplay:** Powered by **Base Sub-Accounts** and a **Paymaster**, all gameplay actions (like submitting a guess) are completely seamless. After a one-time setup, users never see a wallet pop-up or pay for gas.
- **Rich Autocomplete Search:** A smart input field allows players to search for KOLs by name, Twitter handle, or ecosystem, making guessing fast, intuitive, and mobile-friendly.
- **Dynamic Hint System:** Receive immediate, color-coded feedback on every guess across multiple attributes, including directional hints (↑↓) for numerical values.
- **Competitive On-Chain Rewards:** A fully on-chain, permissionless `finalizeGame` function calculates results. The top 40% of players win a share of a prize pool funded by the deposits of the bottom 60%.
- **"Share on X":** A built-in feature to share your daily results with a formatted, emoji-based grid to engage with the community.

## 🛠️ Tech Stack & Architecture

This project is a modern dApp composed of a Next.js frontend and a Solidity smart contract.

| Component          | Technology                                       |
| ------------------ | ------------------------------------------------ |
| **Blockchain**     | Base Sepolia (Testnet)                           |
| **Smart Contract** | Solidity, Foundry                                |
| **Libraries**      | Solady (for gas optimization), `forge-std`       |
| **Frontend**       | Next.js (App Router), TypeScript, TailwindCSS    |
| **Web3 Frontend**  | Wagmi, Viem, Base Account SDK (`@coinbase/waas`) |
| **Data Storage**   | Vercel Edge Config (for off-chain KOL data)      |

### Architecture Overview

1.  **Frontend (Next.js):** The user-facing application that handles the game's UI, state management, and interaction logic.
2.  **Smart Contract (`Cypher.sol`):** The on-chain "engine" deployed on Base. It is the source of truth for game state, player data, and funds.
3.  **Base Sub-Accounts:** The frontend uses the Base Account SDK to create an app-specific "sub-account" for each user. This account, controlled by a temporary session key, signs all subsequent gameplay transactions.
4.  **Paymaster:** All transactions sent from the sub-account are routed through a Paymaster, which sponsors the gas fees, making the game free to play (after the initial deposit).
5.  **Vercel Edge Config:** A low-latency data store for the off-chain KOL database, which the frontend fetches to power the autocomplete search and hint system.

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later)
- Foundry (for Solidity development)
- `pnpm` (or `npm`/`yarn`)

### 1\. Clone the Repository

```bash
git clone https://github.com/chukwukap/cypher-frontend.git
cd cypher-frontend
```

### 2\. Install Dependencies

Install both the frontend and smart contract dependencies.

```bash
# Install frontend packages
pnpm install

# Install smart contract libraries
forge install
```

### 3\. Environment Setup

Create a `.env.local` file in the root of the project. This file will store your secret keys and configuration variables.

```env
# An RPC URL for Base Sepolia (e.g., from Alchemy or Infura)
NEXT_PUBLIC_RPC_URL="https://sepolia.base.org"

# The private key of the wallet you will use to deploy the contract
PRIVATE_KEY="0x..."

# (After deployment) The address of your deployed Cypher.sol contract
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

### 4\. Deploy the Smart Contract

Deploy the `Cypher.sol` contract to the Base Sepolia testnet using Foundry.

```bash
# Make sure your .env file is configured
forge script script/Deploy.s.sol:DeployScript --rpc-url $NEXT_PUBLIC_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

After deployment, copy the new contract address and paste it into the `NEXT_PUBLIC_CONTRACT_ADDRESS` variable in your `.env.local` file.

### 5\. Run the Frontend

Start the Next.js development server.

```bash
pnpm dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to play the game.

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
