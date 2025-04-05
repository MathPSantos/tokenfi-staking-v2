import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import { readContract } from "@wagmi/core";
import { erc20Abi, isAddress } from "viem";

import {
  approveAllowance,
  switchUserChain,
  writeContractAndWaitForReceipt,
} from "@/lib/packages/wagmi";
import { wagmiAdapter } from "@/lib/packages/app-kit";
import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";

import { useGetStakingTokenAddress } from "./get-staking-token-address";

type CreateStakeData = {
  amount: bigint;
  duration: bigint;
};

export function useCreateStake() {
  const queryClient = useQueryClient();
  const { data: stakingTokenAddress } = useGetStakingTokenAddress();
  const account = useAppKitAccount({ namespace: "eip155" });

  return useMutation({
    mutationFn: async (data: CreateStakeData) => {
      if (!account.address || !isAddress(account.address))
        throw new Error("User not connected");
      if (!stakingTokenAddress)
        throw new Error("Staking token address not found");

      await switchUserChain({
        chainId: 56,
      });

      const balance = await readContract(wagmiAdapter.wagmiConfig, {
        abi: erc20Abi,
        address: stakingTokenAddress,
        functionName: "balanceOf",
        args: [account.address],
      });

      if (balance < data.amount) throw new Error("Insufficient balance");

      await approveAllowance({
        chainId: 56,
        spenderAddress: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        tokenAddress: stakingTokenAddress,
        transferValue: data.amount,
        user: account.address,
      });

      return writeContractAndWaitForReceipt({
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "stake",
        args: [data.amount, 0, data.duration],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakes"] });
    },
  });
}
