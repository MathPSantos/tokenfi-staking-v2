import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { isAddress } from "viem";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";

export function useListStakesByUserAddress({ user }: { user?: string }) {
  return useQuery({
    queryKey: ["get-user-stakes", { user }],
    queryFn: () => {
      if (!user || !isAddress(user)) {
        throw new Error("Invalid user address");
      }

      return readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "getUserStakes",
        args: [user],
      });
    },
    enabled: !!user,
  });
}
