"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface GameHeaderProps {
  gameId: bigint | null;
  attempts: number;
  maxAttempts?: number;
}

export function GameHeader({
  gameId,
  attempts,
  maxAttempts = 8,
}: GameHeaderProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [now, setNow] = useState<number>(Date.now());

  // Tick every second to update countdown.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Compute time remaining in current 24h cycle based on wall-clock.
  const { hours, minutes, seconds } = useMemo(() => {
    const msInDay = 86400 * 1000;
    const msElapsedToday = now % msInDay;
    const msRemaining = msInDay - msElapsedToday;
    const totalSeconds = Math.floor(msRemaining / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { hours: h, minutes: m, seconds: s };
  }, [now]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-mono text-3xl font-bold tracking-tight">CYPHER</h1>
        {gameId !== null && (
          <p className="text-sm text-muted-foreground">
            Game #{gameId.toString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Time left today</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {hours.toString().padStart(2, "0")}:
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Attempts</p>
          <p className="font-mono text-lg font-semibold">
            {attempts} / {maxAttempts}
          </p>
        </div>

        {address && (
          <div className="hidden sm:block text-right">
            <p className="text-xs text-muted-foreground">Wallet</p>
            <p className="font-mono text-sm">{formatAddress(address)}</p>
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => disconnect()}
          className="border-border"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
