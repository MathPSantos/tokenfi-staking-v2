import { useAppKitAccount } from "@reown/appkit/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StakingPoolContract } from "@/lib/contracts";
import {
  switchUserChain,
  writeContractAndWaitForReceipt,
} from "@/lib/packages/wagmi";
import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";

export function useClaimStakeRewards() {
  const account = useAppKitAccount({ namespace: "eip155" });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stakeIndex: number) => {
      await switchUserChain({ chainId: 56 });

      return writeContractAndWaitForReceipt({
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "claimRewards",
        args: [BigInt(stakeIndex)],
      });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["get-user-stakes", { user: account.address }],
      });
    },
  });
}
