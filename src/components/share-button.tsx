"use client"

import { Button } from "@/components/ui/button"
import type { GuessWithHints } from "@/lib/types"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  gameId: bigint | null
  guessesAndHints: GuessWithHints[]
  attempts: number
}

export function ShareButton({ gameId, guessesAndHints, attempts }: ShareButtonProps) {
  const generateShareText = () => {
    // Generate emoji grid based on hints
    const emojiGrid = guessesAndHints
      .map((item) => {
        return item.hints
          .map((hint) => {
            if (hint.type === "correct") return "🟩"
            if (hint.type === "close") return "🟨"
            return "⬛"
          })
          .join("")
      })
      .join("\n")

    const text = `Cypher #${gameId?.toString() || "?"} ${attempts}/6\n\n${emojiGrid}\n\nPlay at:`
    const url = typeof window !== "undefined" ? window.location.origin : "https://cypher.game"

    return { text, url }
  }

  const handleShare = () => {
    const { text, url } = generateShareText()
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(url)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`

    window.open(twitterUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Button onClick={handleShare} variant="outline" className="w-full border-border bg-transparent" size="lg">
      <Share2 className="mr-2 h-4 w-4" />
      Share on X
    </Button>
  )
}
