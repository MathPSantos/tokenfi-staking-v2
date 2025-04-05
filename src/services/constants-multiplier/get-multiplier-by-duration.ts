import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { isAddress, parseUnits } from "viem";

import { MultipliersContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";
import { useGetRewardsMultiplierContractAddress } from "@/services/staking/get-rewards-multiplier-contract-address";
import { TOKENFI_STAKING_TOKEN_DECIMALS } from "@/lib/constants";

const DEFAULT_AMOUNT = parseUnits("1", TOKENFI_STAKING_TOKEN_DECIMALS);

export function useGetMultiplierByDuration({
  amount = DEFAULT_AMOUNT,
  duration,
}: {
  amount?: bigint;
  duration?: bigint;
}) {
  const { data: address } = useGetRewardsMultiplierContractAddress();

  return useQuery({
    queryKey: [
      "get-multiplier-by-duration",
      { amount: amount.toString(), duration: duration?.toString() },
    ],
    queryFn: () => {
      if (!amount || !duration) {
        throw new Error("Invalid amount or duration");
      }

      if (!address || !isAddress(address)) {
        throw new Error("Invalid address");
      }

      return readContract(wagmiAdapter.wagmiConfig, {
        abi: MultipliersContract.abi,
        address,
        functionName: "getMultiplier",
        args: [amount, duration],
      });
    },
    enabled: !!amount && !!duration,
  });
}
