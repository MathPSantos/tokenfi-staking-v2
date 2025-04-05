import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { isAddress } from "viem";

import { MultipliersContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";
import { useGetRewardsMultiplierContractAddress } from "@/services/staking/get-rewards-multiplier-contract-address";

export function useGetDurationThresholds() {
  const { data: address } = useGetRewardsMultiplierContractAddress();

  return useQuery({
    queryKey: ["get-duration-thresholds", { address }],
    queryFn: () => {
      if (!address || !isAddress(address)) {
        throw new Error("Invalid address");
      }

      return readContract(wagmiAdapter.wagmiConfig, {
        abi: MultipliersContract.abi,
        address,
        functionName: "getDurationThresholds",
      });
    },
    enabled: !!address,
  });
}
