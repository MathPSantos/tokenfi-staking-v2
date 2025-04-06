import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { PenaltyFeeContract } from "@/lib/contracts";
import { useGetPenaltyFeeCalculatorContractAddress } from "@/services/staking/get-penalty-fee-calculator-contract-address";
import { wagmiAdapter } from "@/lib/packages/app-kit";

type UseCalculatePenaltyParams = {
  duration: bigint;
  stakedAmount: bigint;
};

export function useCalculatePenalty({
  duration,
  stakedAmount,
}: UseCalculatePenaltyParams) {
  const { data: penaltyFeeCalculatorContractAddress } =
    useGetPenaltyFeeCalculatorContractAddress();

  return useQuery({
    queryKey: [
      "calculate-penalty",
      {
        duration: duration.toString(),
        stakedAmount: stakedAmount.toString(),
      },
    ],
    queryFn: () => {
      if (!penaltyFeeCalculatorContractAddress) {
        throw new Error("Penalty fee calculator contract address not found");
      }

      return readContract(wagmiAdapter.wagmiConfig, {
        abi: PenaltyFeeContract.abi,
        address: penaltyFeeCalculatorContractAddress,
        functionName: "calculate",
        args: [stakedAmount, duration, TOKENFI_STAKING_POOL_CONTRACT_ADDRESS],
      });
    },
    enabled: !!penaltyFeeCalculatorContractAddress,
  });
}
