"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { KOL, PlayerStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface InputControllerProps {
  allKOLs: KOL[];
  playerStatus: PlayerStatus;
  isLoading: boolean;
  submitGuess: (guess: KOL) => Promise<void>;
}

export function InputController({
  allKOLs,
  playerStatus,

  submitGuess,
}: InputControllerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const filteredKOLs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allKOLs.slice(0, 20);
    return allKOLs
      .filter(
        (kol) =>
          kol.name.toLowerCase().includes(term) ||
          kol.twitterHandle.toLowerCase().includes(term) ||
          kol.attributes.ecosystem.toLowerCase().includes(term)
      )
      .slice(0, 20);
  }, [searchTerm, allKOLs]);

  const handleKOLClick = async (kol: KOL) => {
    setSearchTerm("");
    setShowDropdown(false);

    if (playerStatus === "ACTIVE") {
      await submitGuess(kol);
    }
  };

  const handleRawGuess = async () => {
    if (!searchTerm.trim()) return;
    setSearchTerm("");
    setShowDropdown(false);
    if (playerStatus === "ACTIVE") {
      // Find the KOL by exact name match; if not found, ignore
      const kol = allKOLs.find(
        (k) => k.name.toLowerCase() === searchTerm.toLowerCase()
      );
      if (kol) await submitGuess(kol);
    }
  };

  const isDisabled = playerStatus === "COMPLETED" || playerStatus === "FAILED";

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
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

      {showDropdown && !isDisabled && (
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
                <div className="flex items-center gap-3">
                  {kol.imageUrl && (
                    <Image
                      width={32}
                      height={32}
                      src={kol.imageUrl}
                      alt={kol.name}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <span>{kol.name}</span>
                      {/* {kol.link && (
                        <a
                          href={kol.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </a>
                      )} */}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{kol.twitterHandle}</span>
                      <span>•</span>
                      <span>{kol.attributes.ecosystem}</span>
                      <span>•</span>
                      <span>{kol.attributes.association}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <button
              onClick={handleRawGuess}
              className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors"
            >
              <div className="text-sm text-muted-foreground">
                No matches found
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
