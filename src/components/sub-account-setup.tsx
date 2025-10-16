"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

interface SubAccountSetupProps {
  isCreating: boolean;
  createSubAccount: () => Promise<void>;
}

export function SubAccountSetup({
  isCreating,
  createSubAccount,
}: SubAccountSetupProps) {
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
          <Zap className="mx-auto h-12 w-12 text-accent" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Setup Game Session</h2>
            <p className="text-sm text-muted-foreground">
              Create a gasless sub-account for seamless gameplay. All
              transactions will be sponsored automatically.
            </p>
          </div>

          <Button
            onClick={createSubAccount}
            disabled={isCreating}
            className="w-full bg-accent hover:bg-accent/90 text-white"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Session...
              </>
            ) : (
              "Create Game Session"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          This creates an application-specific wallet for gasless transactions
        </p>
      </div>
    </div>
  );
}
