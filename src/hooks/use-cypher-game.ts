"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
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

const useUSDCBalance = (address?: `0x${string}`) => {
  return useReadContract({
    address: USDC.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
};

export function useCypherGame(allKOLs: KOL[] = []) {
  const { addresses, address } = useAccount();
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

  const { data: currentGameIdData } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "currentGameId",
  });

  const { data: playerData, refetch: refetchPlayerData } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "dailyPlayerData",
    args: address && gameId ? [gameId, address] : undefined,
    query: { enabled: !!address && !!gameId },
  });

  const { data: finalizedData, refetch: refetchFinalized } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "isFinalized",
    args: gameId ? [gameId] : undefined,
    query: { enabled: !!gameId },
  });

  const { data: winningsData, refetch: refetchWinnings } = useReadContract({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    functionName: "dailyWinnings",
    args: address && gameId ? [gameId, address] : undefined,
    query: { enabled: !!address && !!gameId },
  });

  const { sendCallsAsync } = useSendCalls();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: pendingTxHash || undefined,
      confirmations: 1,
    });

  useEffect(() => {
    if (currentGameIdData) {
      setGameId(currentGameIdData);
    }
  }, [currentGameIdData]);

  useEffect(() => {
    if (playerData) {
      const [statusData, assignedHash, , , , attemptsData] = playerData as [
        number,
        `0x${string}`,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
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

  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      toast.success("Transaction confirmed", {
        description: "Your transaction has been confirmed",
      });
      setPendingTxHash(null);
      setIsLoading(false);
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

  const { data: balance1 } = useUSDCBalance(addresses?.[0]);
  const { data: balance2 } = useUSDCBalance(addresses?.[1]);

  const startGame = useCallback(
    async (usdcAmount: number = 1) => {
      if (!gameId) {
        toast.error("Game ID not loaded");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const amountWei = BigInt(Math.floor(usdcAmount * 10 ** USDC.decimals));

        if (
          (!balance1 || balance1 < amountWei) &&
          (!balance2 || balance2 < amountWei)
        ) {
          toast.error("Neither account has enough USDC to start the game.");
          setIsLoading(false);
          return;
        }

        const approveCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [CYPHER_CONTRACT_ADDRESS, amountWei],
        });
        const startGameCalldata = encodeFunctionData({
          abi: CYPHER_ABI,
          functionName: "startGame",
          args: [amountWei],
        });

        toast.loading("Starting game...");
        await sendCallsAsync({
          calls: [
            { to: USDC.address, data: approveCalldata },
            { to: CYPHER_CONTRACT_ADDRESS, data: startGameCalldata },
          ],
        });

        toast.dismiss();
        setGuessesAndHints([]);

        setTimeout(() => {
          refetchPlayerData();
          refetchFinalized();
          refetchWinnings();
          setIsLoading(false);
        }, 2000);
      } catch (err) {
        console.error("error", err);
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
      balance1,
      balance2,
      refetchPlayerData,
      refetchFinalized,
      refetchWinnings,
    ]
  );

  const submitGuess = useCallback(
    async (guess: KOL) => {
      setIsLoading(true);
      setError(null);
      toast.loading("Submitting guess...");
      try {
        const submitGuessCalldata = encodeFunctionData({
          abi: CYPHER_ABI,
          functionName: "submitGuess",
          args: [guess.name],
        });

        toast.loading("Submitting guess...");
        await sendCallsAsync({
          calls: [{ to: CYPHER_CONTRACT_ADDRESS, data: submitGuessCalldata }],
        });

        toast.dismiss();
        const target = assignedKOLHash
          ? allKOLs.find((k) => k.id === assignedKOLHash)
          : undefined;
        if (target) {
          const hints = generateHints(guess, target);
          setGuessesAndHints((prev) => [...prev, { guess, hints }]);
        }
      } catch (err) {
        console.error("error", err);
        toast.dismiss();
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit guess";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    },
    [allKOLs, assignedKOLHash, sendCallsAsync]
  );

  const claimReward = useCallback(async () => {
    if (!gameId) {
      toast.error("Game ID not loaded");
      return;
    }
    setIsLoading(true);
    setError(null);
    toast.loading("Claiming reward...");
    try {
      const claimRewardCalldata = encodeFunctionData({
        abi: CYPHER_ABI,
        functionName: "claimReward",
        args: [gameId],
      });
      await sendCallsAsync({
        calls: [{ to: CYPHER_CONTRACT_ADDRESS, data: claimRewardCalldata }],
      });
      toast.dismiss();
      toast.success("Reward claimed successfully!");
      setIsLoading(false);
    } catch (err) {
      console.error("error", err);
      toast.dismiss();
      const errorMessage =
        err instanceof Error ? err.message : "Failed to claim reward";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  }, [gameId, sendCallsAsync]);

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "GameStarted",
    onLogs: (logs) => {
      console.log("logs", logs);
      for (const l of logs) {
        const args = l.args as {
          gameId: bigint;
          player: `0x${string}`;
          assignedKOLHash: `0x${string}`;
        };
        if (!args) continue;
        if (
          address &&
          args.player === address &&
          gameId !== null &&
          args.gameId === gameId
        ) {
          setPlayerStatus("ACTIVE");
          setAssignedKOLHash(args.assignedKOLHash);
          setAttempts(0);
          setGuessesAndHints([]);
        }
      }
    },
  });

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "GuessSubmitted",
    onLogs: (logs) => {
      console.log("logs", logs);
      for (const l of logs) {
        const args = l.args as {
          gameId: bigint;
          player: `0x${string}`;
          attempts: bigint;
        };
        if (!args) continue;
        if (
          address &&
          args.player === address &&
          gameId !== null &&
          args.gameId === gameId
        ) {
          setAttempts(Number(args.attempts));
        }
      }
    },
  });

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "GameFinalized",
    onLogs: (logs) => {
      console.log("logs", logs);
      for (const l of logs) {
        const args = l.args as { gameId: bigint };
        if (!args) continue;
        if (gameId !== null && args.gameId === gameId) {
          setIsFinalized(true);
          refetchWinnings();
        }
      }
    },
  });

  useWatchContractEvent({
    address: CYPHER_CONTRACT_ADDRESS,
    abi: CYPHER_ABI,
    eventName: "RewardClaimed",
    onLogs: (logs) => {
      console.log("logs", logs);
      for (const l of logs) {
        const args = l.args as {
          gameId: bigint;
          player: `0x${string}`;
          amount: bigint;
        };
        if (!args) continue;
        if (
          address &&
          args.player === address &&
          gameId !== null &&
          args.gameId === gameId
        ) {
          setWinnings(BigInt(0));
          toast.success("Reward claimed successfully!");
        }
      }
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
