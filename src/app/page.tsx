"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/contract";
import { useCypherGame } from "@/hooks/use-cypher-game";
import { fetchKOLs } from "@/lib/kol-data";
import type { KOL } from "@/lib/types";

// Components
import { LoadingScreen } from "@/components/loading-screen";
import { NetworkSwitchModal } from "@/components/network-switch-modal";
import { ConnectWallet } from "@/components/connect-wallet";
import { GameHeader } from "@/components/game-header";
import { HintDisplay } from "@/components/hint-display";
import { InputController } from "@/components/input-controller";
import { ResultsView } from "@/components/results-view";
import { ShareButton } from "@/components/share-button";

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [allKOLs, setAllKOLs] = useState<KOL[]>([]);
  const [isLoadingKOLs, setIsLoadingKOLs] = useState(true);

  // Hooks
  const {
    gameId,
    playerStatus,
    attempts,
    guessesAndHints,
    isFinalized,
    winnings,
    isLoading,
    startGame,
    submitGuess,
    claimReward,
  } = useCypherGame();

  // Fetch KOL data on mount
  useEffect(() => {
    const loadKOLs = async () => {
      try {
        const kols = await fetchKOLs();
        setAllKOLs(kols);
      } catch (error) {
        console.error("Failed to load KOLs:", error);
      } finally {
        setIsLoadingKOLs(false);
      }
    };

    loadKOLs();
  }, []);

  // Conditional rendering flow (priority order)

  // 1. Initial app load - fetching KOL data
  if (isLoadingKOLs) {
    return <LoadingScreen />;
  }

  // 2. Wrong network
  if (isConnected && chainId !== BASE_SEPOLIA_CHAIN_ID) {
    return <NetworkSwitchModal />;
  }

  // 3. Wallet disconnected
  if (!isConnected) {
    return <ConnectWallet />;
  }

  // 4. Main game view
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <GameHeader gameId={gameId} attempts={attempts} maxAttempts={8} />

        <div className="space-y-6">
          {/* Input controller */}
          <InputController
            allKOLs={allKOLs}
            playerStatus={playerStatus}
            isLoading={isLoading}
            startGame={startGame}
            submitGuess={submitGuess}
          />

          {/* Hint display */}
          <HintDisplay guessesAndHints={guessesAndHints} />

          {/* Results view (only show when completed or failed) */}
          {(playerStatus === "COMPLETED" || playerStatus === "FAILED") && (
            <div className="space-y-4">
              <ResultsView
                isFinalized={isFinalized}
                winnings={winnings}
                isLoading={isLoading}
                claimReward={claimReward}
              />

              {/* Share button (only show when completed) */}
              {playerStatus === "COMPLETED" && (
                <ShareButton
                  gameId={gameId}
                  guessesAndHints={guessesAndHints}
                  attempts={attempts}
                />
              )}
            </div>
          )}

          {/* Game status indicator */}
          {playerStatus === "ACTIVE" && (
            <div className="rounded-lg border border-border bg-panel p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {8 - attempts} {8 - attempts === 1 ? "attempt" : "attempts"}{" "}
                remaining
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Base • Gasless transactions via sub-accounts
          </p>
        </div>
      </div>
    </div>
  );
}
