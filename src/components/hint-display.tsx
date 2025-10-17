"use client";

import type { GuessWithHints } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HintDisplayProps {
  guessesAndHints: GuessWithHints[];
}

export function HintDisplay({ guessesAndHints }: HintDisplayProps) {
  if (guessesAndHints.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center">
        <p className="text-muted-foreground">
          Make your first guess to see hints about the target KOL
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {guessesAndHints.map((item, guessIndex) => (
        <div
          key={guessIndex}
          className="rounded-lg border border-border bg-panel p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{item.guess.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.guess.twitterHandle}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              Guess {guessIndex + 1}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {item.hints.map((hint, hintIndex) => {
              const bgColor =
                hint.type === "correct"
                  ? "bg-[#10b981]"
                  : hint.type === "close"
                  ? "bg-[#f59e0b]"
                  : "bg-[#4b5563]";

              return (
                <div
                  key={hintIndex}
                  className={cn(
                    "flex flex-col items-center justify-center rounded p-2 text-white flip-animation",
                    bgColor
                  )}
                  style={{ animationDelay: `${hintIndex * 100}ms` }}
                >
                  <span className="text-[10px] uppercase opacity-80 tracking-wide">
                    {hint.attribute === "pfpTheme" ? "PFP" : hint.attribute}
                  </span>
                  <span className="text-xs font-semibold mt-0.5">
                    {(() => {
                      const a = item.guess.attributes;
                      switch (hint.attribute) {
                        case "followers":
                          return Intl.NumberFormat().format(a.followers);
                        case "age":
                          return a.age;
                        case "association":
                          return a.association;
                        case "ecosystem":
                          return a.ecosystem;
                        case "pfpTheme":
                          return a.pfpTheme;
                        default:
                          return "";
                      }
                    })()}
                  </span>
                  {hint.direction && (
                    <div className="mt-1">
                      {hint.direction === "higher" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
