import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";

export function useGetStakingTokenAddress({ chainId }: { chainId: number }) {
  return useQuery({
    queryKey: ["get-staking-token-address", { chainId }],
    queryFn: () => {
      return readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "stakingToken",
        chainId,
      });
    },
    gcTime: Infinity,
    staleTime: Infinity,
  });
}
