import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { wagmiAdapter } from "@/lib/packages/app-kit";
import { StakingPoolContract } from "@/lib/contracts";

export function useGetTotalWeightedStake() {
  return useQuery({
    queryKey: ["get-total-weighted-stake"],
    queryFn: () => {
      return readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "totalWeightedStake",
      });
    },
  });
}
