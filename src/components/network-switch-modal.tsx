"use client"

import { Button } from "@/components/ui/button"
import { useSwitchChain } from "wagmi"
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/contract"
import { AlertTriangle } from "lucide-react"

export function NetworkSwitchModal() {
  const { switchChain, isPending } = useSwitchChain()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-panel p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-[#f59e0b]" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Wrong Network</h2>
            <p className="text-sm text-muted-foreground">
              Cypher runs on Base Sepolia. Please switch your network to continue playing.
            </p>
          </div>
        </div>

        <Button
          onClick={() => switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })}
          disabled={isPending}
          className="w-full bg-accent hover:bg-accent/90 text-white"
          size="lg"
        >
          {isPending ? "Switching..." : "Switch to Base Sepolia"}
        </Button>
      </div>
    </div>
  )
}
