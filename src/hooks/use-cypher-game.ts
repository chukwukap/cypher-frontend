"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWatchContractEvent,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CYPHER_CONTRACT_ADDRESS, CYPHER_ABI } from "@/lib/contract";
import { USDC, erc20Abi } from "@/lib/usdc";
import type { KOL, PlayerStatus, GuessWithHints } from "@/lib/types";
import { generateHints } from "@/lib/hint-generator";
import { getTodayTarget } from "@/lib/kol-data";
import { toast } from "sonner";

export function useCypherGame() {
  const { address } = useAccount();
  const [gameId, setGameId] = useState<bigint | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("EMPTY");
  const [attempts, setAttempts] = useState(0);
  const [guessesAndHints, setGuessesAndHints] = useState<GuessWithHints[]>([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [winnings, setWinnings] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(
    null
  );

  // Get current game ID
  const { data: currentGameIdData } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "currentGameId",
  });

  // Get player data
  const { data: playerData, refetch: refetchPlayerData } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "dailyPlayerData",
    args: address && gameId ? [gameId, address] : undefined,
    query: {
      enabled: !!address && !!gameId,
    },
  });

  // Get finalized status
  const { data: finalizedData, refetch: refetchFinalized } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "isFinalized",
    args: gameId ? [gameId] : undefined,
    query: {
      enabled: !!gameId,
    },
  });

  // Get winnings
  const { data: winningsData, refetch: refetchWinnings } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "dailyWinnings",
    args: address && gameId ? [gameId, address] : undefined,
    query: {
      enabled: !!address && !!gameId,
    },
  });

  // Contract write hooks
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: pendingTxHash || undefined,
    });

  // Update state from contract data
  useEffect(() => {
    if (currentGameIdData) {
      setGameId(currentGameIdData as bigint);
    }
  }, [currentGameIdData]);

  useEffect(() => {
    if (playerData) {
      const [statusData, , , , , attemptsData] = playerData as [
        number,
        string,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ];
      setAttempts(Number(attemptsData));

      const statusMap: Record<number, PlayerStatus> = {
        0: "EMPTY",
        1: "ACTIVE",
        2: "COMPLETED",
        3: "FAILED",
      };
      setPlayerStatus(statusMap[statusData] || "EMPTY");
    }
  }, [playerData]);

  useEffect(() => {
    if (finalizedData !== undefined) {
      setIsFinalized(finalizedData as boolean);
    }
  }, [finalizedData]);

  useEffect(() => {
    if (winningsData !== undefined) {
      setWinnings(winningsData as bigint);
    }
  }, [winningsData]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      toast.success("Transaction confirmed", {
        description: "Your transaction has been confirmed",
      });
      setPendingTxHash(null);
      setIsLoading(false);

      // Refetch all data
      refetchPlayerData();
      refetchFinalized();
      refetchWinnings();
    }
  }, [
    isConfirmed,
    pendingTxHash,
    refetchPlayerData,
    refetchFinalized,
    refetchWinnings,
  ]);

  // Start game
  const startGame = useCallback(
    async (firstGuess: KOL, usdcAmount: number = 1) => {
      if (!gameId) {
        toast.error("Game ID not loaded");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        toast.loading("Approving USDC...");
        const amountWei = BigInt(Math.floor(usdcAmount * 10 ** USDC.decimals));
        await writeContractAsync({
          address: USDC.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [CYPHER_CONTRACT_ADDRESS, amountWei],
        });

        toast.dismiss();
        toast.loading("Starting game...");

        const hash = await writeContractAsync({
          address: CYPHER_CONTRACT_ADDRESS,
          abi: CYPHER_ABI,
          functionName: "startGame",
          args: [amountWei, firstGuess.name],
        });

        setPendingTxHash(hash);
        toast.dismiss();
        toast.loading("Confirming transaction...");

        // Generate hints client-side
        const target = getTodayTarget();
        const hints = generateHints(firstGuess, target);
        setGuessesAndHints([{ guess: firstGuess, hints }]);
      } catch (err) {
        toast.dismiss();
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start game";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    },
    [gameId, writeContractAsync]
  );

  // Submit guess
  const submitGuess = useCallback(
    async (guess: KOL) => {
      setIsLoading(true);
      setError(null);

      try {
        toast.loading("Submitting guess...");

        const hash = await writeContractAsync({
          address: CYPHER_CONTRACT_ADDRESS,
          abi: CYPHER_ABI,
          functionName: "submitGuess",
          args: [guess.name],
        });

        setPendingTxHash(hash);
        toast.dismiss();
        toast.loading("Confirming transaction...");

        // Generate hints client-side
        const target = getTodayTarget();
        const hints = generateHints(guess, target);
        setGuessesAndHints((prev) => [...prev, { guess, hints }]);
      } catch (err) {
        toast.dismiss();
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit guess";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    },
    [writeContractAsync]
  );

  // Claim reward
  const claimReward = useCallback(async () => {
    if (!gameId) {
      toast.error("Game ID not loaded");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast.loading("Claiming reward...");

      const hash = await writeContractAsync({
        address: CYPHER_CONTRACT_ADDRESS,
        abi: CYPHER_ABI,
        functionName: "claimReward",
        args: [gameId],
      });

      setPendingTxHash(hash);
      toast.dismiss();
      toast.loading("Confirming transaction...");
    } catch (err) {
      toast.dismiss();
      const errorMessage =
        err instanceof Error ? err.message : "Failed to claim reward";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  }, [gameId, writeContractAsync]);

  // Watch contract events
  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "GameStarted",
    onLogs: () => {
      refetchPlayerData();
    },
  });

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "GuessSubmitted",
    onLogs: () => {
      refetchPlayerData();
    },
  });

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "GameFinalized",
    onLogs: () => {
      refetchFinalized();
      refetchWinnings();
    },
  });

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "RewardClaimed",
    onLogs: () => {
      refetchWinnings();
      toast.success("Reward claimed successfully!");
    },
  });

  return {
    gameId,
    playerStatus,
    attempts,
    guessesAndHints,
    isFinalized,
    winnings,
    isLoading: isLoading || isConfirming,
    error,
    startGame,
    submitGuess,
    claimReward,
  };
}
