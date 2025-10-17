"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface StartGameInputProps {
  isLoading: boolean;
  startGame: (amount: number) => Promise<void>;
}

export function StartGameInput({ isLoading, startGame }: StartGameInputProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleStartGame = async () => {
    setError("");

    // Validate amount
    const numAmount = Number.parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    await startGame(numAmount);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && amount && !isLoading) {
      handleStartGame();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-panel p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Start Today&apos;s Game</h2>
          <p className="text-sm text-muted-foreground">
            Enter the amount of USDC you want to wager. You&apos;ll have 8
            attempts to guess the correct KOL.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Enter USDC amount (e.g., 10)"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="pl-10 bg-background border-border"
              min="0"
              step="0.01"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleStartGame}
            disabled={!amount || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Starting Game..." : "Start Game"}
          </Button>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max Attempts:</span>
            <span className="font-medium">8</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Winners Share:</span>
            <span className="font-medium">Top 40%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prize Pool:</span>
            <span className="font-medium">Failed players&apos; deposits</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-panel/50 p-4">
        <p className="text-xs text-muted-foreground text-center">
          Make sure you have enough USDC in your wallet.
        </p>
      </div>
    </div>
  );
}
