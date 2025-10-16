"use client";

import { useConnect, useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function ConnectWallet() {
  const { connectors, connect } = useConnect();
  const { isConnecting } = useAccount();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-mono text-4xl font-bold tracking-tight">
            CYPHER
          </h1>
          <p className="text-lg text-muted-foreground">The Onchain Gauntlet</p>
        </div>

        <div className="rounded-lg border border-border bg-panel p-8 space-y-4">
          <Wallet className="mx-auto h-12 w-12 text-accent" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to start playing the daily guessing game
            </p>
          </div>

          <Button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnecting}
            className="w-full bg-accent hover:bg-accent/90 text-white"
            size="lg"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Powered by Base • Gasless transactions via sub-accounts
        </p>
      </div>
    </div>
  );
}
