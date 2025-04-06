import { parseUnits } from "viem";

import { useGetMultiplierByDuration } from "@/services/constants-multiplier/get-multiplier-by-duration";
import { useCalculateAPR } from "@/services/staking/calculate-apr";
import { TOKENFI_STAKING_TOKEN_DECIMALS } from "../constants";

export function useAPRForDuration(threshold: bigint) {
  const { data: multiplier } = useGetMultiplierByDuration({
    duration: threshold,
  });

  return useCalculateAPR({
    amount: parseUnits("1", TOKENFI_STAKING_TOKEN_DECIMALS),
    multiplier: multiplier || 0n,
    isNewStaking: true,
  });
}
