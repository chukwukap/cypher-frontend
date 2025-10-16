"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { toast } from "sonner";

// Note: In production, this would use the Base Account SDK
// For now, we'll simulate sub-account creation
export function useSubAccount() {
  const { address, connector } = useAccount();
  const [subAccountAddress, setSubAccountAddress] = useState<Address | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubAccount = useCallback(async () => {
    if (!address || !connector) {
      setError("Wallet not connected");
      toast.error("Please connect your wallet first", {
        description: "Please connect your wallet first",
      });
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Simulate sub-account creation
      // In production, this would use:
      // const provider = await connector.getProvider()
      // const sdk = new BaseAccountSDK(provider)
      // const signer = await sdk.getOrCreateSubAccount()

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, use the main wallet address as sub-account
      setSubAccountAddress(address);
      toast.success("Game session created!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create sub-account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [address, connector]);

  return {
    createSubAccount,
    subAccountAddress,
    isCreating,
    error,
  };
}
