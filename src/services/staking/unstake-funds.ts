import { useAppKitAccount } from "@reown/appkit/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";
import { writeContractAndWaitForReceipt } from "@/lib/packages/wagmi";

type UseUnstakeFundsParams = {
  amount: bigint;
  stakeIndex: number;
  chainId: number;
};

export function useUnstakeFunds() {
  const account = useAppKitAccount({ namespace: "eip155" });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      stakeIndex,
      chainId,
    }: UseUnstakeFundsParams) => {
      return writeContractAndWaitForReceipt({
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "unstake",
        chainId,
        args: [amount, BigInt(stakeIndex)],
      });
    },
    onSuccess: (_, { chainId }) => {
      return queryClient.invalidateQueries({
        queryKey: ["get-user-stakes", { user: account?.address, chainId }],
      });
    },
  });
}
