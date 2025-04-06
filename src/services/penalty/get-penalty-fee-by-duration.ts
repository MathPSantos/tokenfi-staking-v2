import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

import { PenaltyFeeContract } from "@/lib/contracts";
import { useGetPenaltyFeeCalculatorContractAddress } from "../staking/get-penalty-fee-calculator-contract-address";
import { wagmiAdapter } from "@/lib/packages/app-kit";
import { useGetDurationThresholds } from "../constants-multiplier/get-duration-thresholds";

type UseGetPenaltyFeeByDurationParams = {
  duration: bigint;
  chainId: number;
};

export function useGetPenaltyFeeByDuration({
  duration,
  chainId,
}: UseGetPenaltyFeeByDurationParams) {
  const { data: penaltyFeeCalculatorContractAddress } =
    useGetPenaltyFeeCalculatorContractAddress({ chainId });
  const { data: durationGroups } = useGetDurationThresholds({ chainId });

  return useQuery({
    queryKey: ["penalty-fee-by-duration", { duration: duration.toString() }],
    queryFn: () => {
      if (!penaltyFeeCalculatorContractAddress) {
        throw new Error("Penalty fee calculator contract address not found");
      }

      if (!durationGroups) {
        throw new Error("Duration groups not found");
      }

      const index = durationGroups.findIndex(
        (group) => duration === group.threshold
      );

      return readContract(wagmiAdapter.wagmiConfig, {
        abi: PenaltyFeeContract.abi,
        address: penaltyFeeCalculatorContractAddress,
        functionName: "penaltyFeePerGroup",
        args: [BigInt(index)],
        chainId,
      });
    },
    enabled: !!penaltyFeeCalculatorContractAddress && !!durationGroups,
  });
}
