"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWatchContractEvent,
  useWaitForTransactionReceipt,
  useSendCalls,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { CYPHER_CONTRACT_ADDRESS, CYPHER_ABI } from "@/lib/contract";
import { USDC, erc20Abi } from "@/lib/usdc";
import type { KOL, PlayerStatus, GuessWithHints } from "@/lib/types";
import { generateHints } from "@/lib/hint-generator";
import { toast } from "sonner";

export function useCypherGame(allKOLs: KOL[] = []) {
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
  const [assignedKOLHash, setAssignedKOLHash] = useState<`0x${string}` | null>(
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
  const { sendCallsAsync } = useSendCalls();

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
      const [statusData, assignedHash, , , , attemptsData] = playerData as [
        number, // status
        `0x${string}`, // assignedKOLHash
        bigint, // depositAmount
        bigint,
        bigint, // startTime
        bigint, // endTime
        bigint // finalScore
      ];
      setAttempts(Number(attemptsData));
      setAssignedKOLHash(assignedHash);

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
      setIsFinalized(finalizedData);
    }
  }, [finalizedData]);

  useEffect(() => {
    if (winningsData !== undefined) {
      setWinnings(winningsData);
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
        const amountWei = BigInt(Math.floor(usdcAmount * 10 ** USDC.decimals));

        // Batch approve + startGame using useSendCalls
        const approveCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [CYPHER_CONTRACT_ADDRESS, amountWei],
        });
        const startGameCalldata = encodeFunctionData({
          abi: CYPHER_ABI,
          functionName: "startGame",
          args: [amountWei, firstGuess.id],
        });

        toast.loading("Making your first guess...");
        await sendCallsAsync({
          calls: [
            { to: USDC.address, data: approveCalldata },
            { to: CYPHER_CONTRACT_ADDRESS, data: startGameCalldata },
          ],
        });

        toast.dismiss();
        toast.success("Submitted. Waiting for confirmations...");

        // Compute target by hash-matching name -> assignedKOLHash
        const target =
          (assignedKOLHash && allKOLs.find((k) => k.id === assignedKOLHash)) ||
          firstGuess;
        const hints = generateHints(firstGuess, target);
        setGuessesAndHints([{ guess: firstGuess, hints }]);

        // Proactively refetch after a short delay (no hash for batch)
        setTimeout(() => {
          refetchPlayerData();
          refetchFinalized();
          refetchWinnings();
          setIsLoading(false);
        }, 2000);
      } catch (err) {
        toast.dismiss();
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start game";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    },
    [
      gameId,
      sendCallsAsync,
      refetchPlayerData,
      refetchFinalized,
      refetchWinnings,
      allKOLs,
      assignedKOLHash,
    ]
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
          args: [guess.id],
        });

        setPendingTxHash(hash);
        toast.dismiss();
        toast.loading("Confirming transaction...");

        // Compute target by hash-matching name -> assignedKOLHash
        const target =
          (assignedKOLHash && allKOLs.find((k) => k.id === assignedKOLHash)) ||
          guess;
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
    [writeContractAsync, allKOLs, assignedKOLHash]
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
