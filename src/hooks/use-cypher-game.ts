"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useSendCalls,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { CYPHER_CONTRACT_ADDRESS, CYPHER_ABI } from "@/lib/contract";
import { USDC, erc20Abi } from "@/lib/usdc";
import type { KOL, PlayerStatus, GuessWithHints } from "@/lib/types";
import { generateHints } from "@/lib/hint-generator";
import { toast } from "sonner";

// const useUSDCBalance = (address?: `0x${string}`) => {
//   return useReadContract({
//     address: USDC.address,
//     abi: erc20Abi,
//     functionName: "balanceOf",
//     args: address ? [address] : undefined,
//     query: { enabled: !!address },
//   });
// };

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

  const { sendTransactionAsync } = useSendTransaction();
  const { data: txReceipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: pendingTxHash || undefined,
      confirmations: 1,
    });

  useEffect(() => {
    if (currentGameIdData) setGameId(currentGameIdData);
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
    if (finalizedData !== undefined) setIsFinalized(finalizedData);
  }, [finalizedData]);

  useEffect(() => {
    if (winningsData !== undefined) setWinnings(winningsData);
  }, [winningsData]);

  useEffect(() => {
    if (txReceipt && pendingTxHash) {
      console.log("txReceipt", txReceipt);
      toast.success("Transaction confirmed");
      setPendingTxHash(null);
      setIsLoading(false);
      refetchPlayerData();
      refetchFinalized();
      refetchWinnings();
    }
  }, [
    txReceipt,
    refetchPlayerData,
    refetchFinalized,
    refetchWinnings,
    pendingTxHash,
  ]);

  const { sendCallsAsync } = useSendCalls();

  // const { data: balance1 } = useUSDCBalance(addresses?.[0]);

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
        // if (
        //   (!balance1 || balance1 < amountWei) &&
        //   (!balance2 || balance2 < amountWei)
        // ) {
        //   toast.error("Neither account has enough USDC to start the game.");
        //   setIsLoading(false);
        //   return;
        // }
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
        await sendCallsAsync({
          calls: [
            { to: USDC.address, data: approveCalldata },
            { to: CYPHER_CONTRACT_ADDRESS, data: startGameCalldata },
          ],
        });
        toast.success("Game started");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to start game";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, sendCallsAsync]
  );

  const submitGuess = useCallback(
    async (guess: KOL) => {
      if (!address) return;
      setIsLoading(true);
      setError(null);
      toast.loading("Submitting guess...");
      try {
        const calldata = encodeFunctionData({
          abi: CYPHER_ABI,
          functionName: "submitGuess",
          args: [guess.name],
        });

        const hash = await sendTransactionAsync({
          to: CYPHER_CONTRACT_ADDRESS,
          data: calldata,
        });

        setPendingTxHash(hash);
        toast.dismiss();
        toast.success("Guess submitted!");

        const target = assignedKOLHash
          ? allKOLs.find((k) => k.id === assignedKOLHash)
          : undefined;
        if (target) {
          const hints = generateHints(guess, target);
          setGuessesAndHints((prev) => [...prev, { guess, hints }]);
        }
      } catch (err) {
        console.error("submitGuess error", err);
        toast.dismiss();
        const msg =
          err instanceof Error ? err.message : "Failed to submit guess";
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
      }
    },
    [sendTransactionAsync, assignedKOLHash, allKOLs, address]
  );

  const claimReward = useCallback(async () => {
    if (!gameId) return;
    setIsLoading(true);
    setError(null);
    toast.loading("Claiming reward...");
    try {
      const calldata = encodeFunctionData({
        abi: CYPHER_ABI,
        functionName: "claimReward",
        args: [gameId],
      });
      const hash = await sendTransactionAsync({
        to: CYPHER_CONTRACT_ADDRESS,
        data: calldata,
      });
      setPendingTxHash(hash);
      toast.dismiss();
      toast.success("Transaction sent. Awaiting confirmation...");
    } catch (err) {
      console.error("claimReward error", err);
      toast.dismiss();
      const msg = err instanceof Error ? err.message : "Failed to claim reward";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  }, [gameId, sendTransactionAsync]);
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
