"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useSendCalls,
  useClient,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { CYPHER_CONTRACT_ADDRESS, CYPHER_ABI } from "@/lib/contract";
import { USDC, erc20Abi } from "@/lib/usdc";
import type { KOL, PlayerStatus, GuessWithHints } from "@/lib/types";
import { generateHints } from "@/lib/hint-generator";
import { toast } from "sonner";

export function useCypherGame(allKOLs: KOL[] = []) {
  const { address } = useAccount();
  const client = useClient();

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

  const startGame = useCallback(
    async (usdcAmount: number = 1) => {
      console.log("usdcAmount", usdcAmount);
      if (!gameId) {
        toast.error("Game ID not loaded");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const amountWei = BigInt(Math.floor(usdcAmount * 10 ** USDC.decimals));
        console.log("amountWei", amountWei);
        const approveCalldata = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [CYPHER_CONTRACT_ADDRESS, amountWei],
        });
        const startGameCalldata = encodeFunctionData({
          abi: [
            {
              type: "function",
              name: "startGame",
              inputs: [
                {
                  name: "_usdcAmount",
                  type: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
          ],
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
        setPlayerStatus("ACTIVE");
        setAttempts(0);
      } catch (err) {
        console.error("startGame error", err);
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
          args: [guess.id],
        });

        const txHash = await client!.transport.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: CYPHER_CONTRACT_ADDRESS,
              data: calldata,
            },
          ],
        });
        setPendingTxHash(txHash as `0x${string}`);

        toast.dismiss();
        toast.success("Guess submitted!");

        // Optimistically update attempts immediately.
        setAttempts((prev) => prev + 1);

        const target = assignedKOLHash
          ? allKOLs.find((k) => k.id === assignedKOLHash)
          : undefined;
        if (target) {
          const hints = generateHints(guess, target);
          setGuessesAndHints((prev) => [...prev, { guess, hints }]);
        }

        // Allow further guesses without blocking UI.
        setIsLoading(false);
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
    [assignedKOLHash, allKOLs, address, client]
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

      await sendCallsAsync({
        calls: [{ to: CYPHER_CONTRACT_ADDRESS, data: calldata }],
      });

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
  }, [gameId, sendCallsAsync]);

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

// @judge: I get this error one browser (chrome) but not the other (brave).

/**
 * 
 main-app.js?v=1760707684604:2278 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
hot-reloader-client.js:282 ./node_modules/.pnpm/@metamask+sdk@0.33.1_bufferutil@4.0.9_utf-8-validate@5.0.10/node_modules/@metamask/sdk/dist/browser/es/metamask-sdk.js
Module not found: Can't resolve '@react-native-async-storage/async-storage' in '/Users/ChukwukaUba/Desktop/base-builder-quests/bbq11/frontend/node_modules/.pnpm/@metamask+sdk@0.33.1_bufferutil@4.0.9_utf-8-validate@5.0.10/node_modules/@metamask/sdk/dist/browser/es'
processMessage @ hot-reloader-client.js:282
handler @ hot-reloader-client.js:508
(index):1 The resource http://localhost:3000/_next/static/css/app/layout.css?v=1760707695411 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
use-cypher-game.ts:141 usdcAmount 1
use-cypher-game.ts:150 amountWei 1000000n
use-cypher-game.ts:183  POST https://chain-proxy.wallet.coinbase.com/?targetName=base-sepolia 400 (Bad Request)
response.errorInstance._errors_request_js__WEBPACK_IMPORTED_MODULE_3__.TimeoutError.body.body @ http.js:46
await in response.errorInstance._errors_request_js__WEBPACK_IMPORTED_MODULE_3__.TimeoutError.body.body
eval @ withTimeout.js:22
eval @ withTimeout.js:32
withTimeout @ withTimeout.js:6
request @ http.js:23
fn @ http.js:56
request @ http.js:60
delay.count.count @ buildRequest.js:40
attemptRetry @ withRetry.js:17
eval @ withRetry.js:27
withRetry @ withRetry.js:8
enabled @ buildRequest.js:38
withDedupe @ withDedupe.js:13
eval @ buildRequest.js:38
request @ createSubAccountSigner.js:201
request @ createSubAccountSigner.js:119
sendRequestToSubAccountSigner @ Signer.js:620
await in sendRequestToSubAccountSigner
_request @ Signer.js:154
request @ Signer.js:112
_request @ BaseAccountProvider.js:142
request @ BaseAccountProvider.js:55
delay.count.count @ buildRequest.js:40
attemptRetry @ withRetry.js:17
eval @ withRetry.js:27
withRetry @ withRetry.js:8
enabled @ buildRequest.js:38
withDedupe @ withDedupe.js:13
eval @ buildRequest.js:38
sendCalls @ sendCalls.js:80
eval @ getAction.js:23
sendCalls @ sendCalls.js:21
await in sendCalls
mutationFn @ sendCalls.js:10
fn @ mutation.js:82
run @ retryer.js:88
start @ retryer.js:130
execute @ mutation.js:121
await in execute
mutate @ mutationObserver.js:69
useCypherGame.useCallback[startGame] @ use-cypher-game.ts:183
handleStartGame @ start-game-input.tsx:29
processDispatchQueue @ react-dom-client.development.js:16146
eval @ react-dom-client.development.js:16749
batchedUpdates$1 @ react-dom-client.development.js:3130
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16305
dispatchEvent @ react-dom-client.development.js:20400
dispatchDiscreteEvent @ react-dom-client.development.js:20368
use-cypher-game.ts:191 startGame error TransactionExecutionError: Execution reverted with reason: failed to estimate gas for user operation: useroperation reverted: .

Request Arguments:
  from:  0x397dEC3CdA73F6d5B793661Ae455fb77dE1585d1

Details: failed to estimate gas for user operation: useroperation reverted: execution reverted
Version: viem@2.38.3
    at getTransactionError (getTransactionError.js:18:12)
    at sendCalls (sendCalls.js:172:104)Caused by: ExecutionRevertedError: Execution reverted with reason: failed to estimate gas for user operation: useroperation reverted: .

Details: failed to estimate gas for user operation: useroperation reverted: execution reverted
Version: viem@2.38.3
    at getNodeError (getNodeError.js:31:16)
    at eval (getTransactionError.js:13:85)
    at getTransactionError (getTransactionError.js:17:7)
    at sendCalls (sendCalls.js:172:104)Caused by: InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
Double check you have provided the correct parameters.

Details: failed to estimate gas for user operation: useroperation reverted: execution reverted
Version: viem@2.38.3
    at delay.count.count (buildRequest.js:56:31)
    at async attemptRetry (withRetry.js:17:30)
error @ intercept-console-error.js:51
useCypherGame.useCallback[startGame] @ use-cypher-game.ts:191
await in useCypherGame.useCallback[startGame]
handleStartGame @ start-game-input.tsx:29
processDispatchQueue @ react-dom-client.development.js:16146
eval @ react-dom-client.development.js:16749
batchedUpdates$1 @ react-dom-client.development.js:3130
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16305
dispatchEvent @ react-dom-client.development.js:20400
dispatchDiscreteEvent @ react-dom-client.development.js:20368
(index):1 The resource http://localhost:3000/_next/static/css/app/layout.css?v=1760707695411 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
(index):1 The resource http://localhost:3000/_next/static/css/app/layout.css?v=1760707695411 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.

 */
