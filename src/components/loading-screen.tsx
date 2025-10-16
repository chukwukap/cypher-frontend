"use client"

import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
        <div className="space-y-2">
          <h2 className="font-mono text-2xl font-bold">CYPHER</h2>
          <p className="text-sm text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    </div>
  )
}
