"use client"

import { useAccount, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface GameHeaderProps {
  gameId: bigint | null
  attempts: number
  maxAttempts?: number
}

export function GameHeader({ gameId, attempts, maxAttempts = 6 }: GameHeaderProps) {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-mono text-3xl font-bold tracking-tight">CYPHER</h1>
        {gameId !== null && <p className="text-sm text-muted-foreground">Game #{gameId.toString()}</p>}
      </div>

      <div className="flex items-center gap-4">
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

        <Button variant="outline" size="icon" onClick={() => disconnect()} className="border-border">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
