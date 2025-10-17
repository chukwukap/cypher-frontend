"use client";

import { useState, useMemo } from "react";
import type { KOL, PlayerStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputControllerProps {
  allKOLs: KOL[];
  playerStatus: PlayerStatus;
  isLoading: boolean;
  startGame: (guess: KOL, amount?: number) => Promise<void>;
  submitGuess: (guess: KOL) => Promise<void>;
}

export function InputController({
  allKOLs,
  playerStatus,
  isLoading,
  startGame,
  submitGuess,
}: InputControllerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState<string>("1");

  const filteredKOLs = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();

    return allKOLs.filter(
      (kol) =>
        kol.name.toLowerCase().includes(term) ||
        kol.twitterHandle.toLowerCase().includes(term) ||
        kol.attributes.ecosystem.toLowerCase().includes(term)
    );
  }, [searchTerm, allKOLs]);

  const handleKOLClick = async (kol: KOL) => {
    setSearchTerm("");
    setShowDropdown(false);
    const amt = Math.max(0, Number.parseFloat(amount) || 0);

    if (playerStatus === "EMPTY") {
      await startGame(kol, amt);
    } else if (playerStatus === "ACTIVE") {
      await submitGuess(kol);
    }
  };

  const handleRawGuess = async () => {
    if (!searchTerm.trim()) return;
    const amt = Math.max(0, Number.parseFloat(amount) || 0);

    // Create a temporary KOL object for raw guesses
    const rawKOL: KOL = {
      id: "0x0000000000000000000000000000000000000000000000000000000000000000",
      name: searchTerm,
      twitterHandle: "",
      attributes: {
        association: "Other",
        ecosystem: "Ethereum",
        pfpTheme: "None",
        followers: 0,
        age: 0,
      },
    };

    setSearchTerm("");
    setShowDropdown(false);

    if (playerStatus === "EMPTY") {
      await startGame(rawKOL, amt);
    } else if (playerStatus === "ACTIVE") {
      await submitGuess(rawKOL);
    }
  };

  const isDisabled =
    isLoading || playerStatus === "COMPLETED" || playerStatus === "FAILED";

  return (
    <div className="relative">
      <div className="mb-3">
        <Input
          type="number"
          inputMode="decimal"
          step="0.000001"
          min="0"
          placeholder="Amount (USDC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isDisabled}
          className="bg-panel border-border"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a KOL..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={isDisabled}
          className="pl-10 bg-panel border-border"
        />
      </div>

      {showDropdown && searchTerm && !isDisabled && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-background shadow-lg max-h-64 overflow-y-auto">
          {filteredKOLs.length > 0 ? (
            filteredKOLs.map((kol) => (
              <button
                key={kol.id}
                onClick={() => handleKOLClick(kol)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors",
                  "border-b border-border last:border-b-0"
                )}
              >
                <div className="font-medium">{kol.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{kol.twitterHandle}</span>
                  <span>•</span>
                  <span>{kol.attributes.ecosystem}</span>
                </div>
              </button>
            ))
          ) : (
            <button
              onClick={handleRawGuess}
              className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors"
            >
              <div className="text-sm text-muted-foreground">
                No matches found. Click to guess &quot;{searchTerm}&quot;
                anyway.
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
