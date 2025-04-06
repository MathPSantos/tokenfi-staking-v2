import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";

export function useGetPenaltyFeeCalculatorContractAddress() {
  return useQuery({
    queryKey: ["penalty-fee-calculator-contract-address"],
    queryFn: () => {
      return readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "penaltyFeeCalculator",
      });
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
