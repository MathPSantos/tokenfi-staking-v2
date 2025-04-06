import { parseUnits } from "viem";

import { useGetMultiplierByDuration } from "@/services/constants-multiplier/get-multiplier-by-duration";
import { useCalculateAPR } from "@/services/staking/calculate-apr";
import { TOKENFI_STAKING_TOKEN_DECIMALS } from "../constants";

type UseAPRForDurationParams = {
  threshold: bigint;
  chainId: number;
};

export function useAPRForDuration({
  threshold,
  chainId,
}: UseAPRForDurationParams) {
  const { data: multiplier } = useGetMultiplierByDuration({
    duration: threshold,
    chainId,
  });

  return useCalculateAPR({
    amount: parseUnits("1", TOKENFI_STAKING_TOKEN_DECIMALS),
    multiplier: multiplier || 0n,
    isNewStaking: true,
    chainId,
  });
}
