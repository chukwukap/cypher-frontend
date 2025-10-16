"use client";

import { Button } from "@/components/ui/button";
import { Trophy, Clock, Loader2 } from "lucide-react";
import { formatUnits } from "viem";

interface ResultsViewProps {
  isFinalized: boolean;
  winnings: bigint;
  isLoading: boolean;
  claimReward: () => Promise<void>;
}

export function ResultsView({
  isFinalized,
  winnings,
  isLoading,
  claimReward,
}: ResultsViewProps) {
  if (!isFinalized) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center space-y-4">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Game In Progress</h3>
          <p className="text-sm text-muted-foreground">
            Results are being calculated. Check back later to see if you won and
            claim your rewards.
          </p>
        </div>
      </div>
    );
  }

  const hasWinnings = winnings > BigInt(0);

  return (
    <div className="rounded-lg border border-border bg-panel p-8 text-center space-y-6">
      {hasWinnings ? (
        <>
          <Trophy className="mx-auto h-16 w-16 text-[#10b981]" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Congratulations!</h3>
            <p className="text-muted-foreground">
              You successfully guessed the target KOL
            </p>
          </div>

          <div className="rounded-lg bg-background p-6 space-y-2">
            <p className="text-sm text-muted-foreground">Your Winnings</p>
            <p className="font-mono text-4xl font-bold text-[#10b981]">
              {formatUnits(winnings, 6)} USDC
            </p>
          </div>

          <Button
            onClick={claimReward}
            disabled={isLoading}
            className="w-full bg-[#10b981] hover:bg-[#10b981]/90 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Reward"
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Game Complete</h3>
            <p className="text-muted-foreground">
              Better luck next time! Come back tomorrow for a new challenge.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
