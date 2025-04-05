import { useQuery } from "@tanstack/react-query";

import { useGetTotalWeightedStake } from "./get-total-weighted-stake";
import { useGetRewardsRatePerSecond } from "./get-rewards-rate-per-second";

type UseFetchAPRParams = {
  amount: bigint;
  multiplier: bigint;
  stakingTokenAmounts: readonly bigint[];
  rewardsTokenAmounts: readonly bigint[];
  isNewStaking: boolean;
};

const ONE_YEAR_IN_SECONDS = 31536000;

// Helper function to convert bigint to number with decimals
function toNumber(value: bigint, decimals: number): number {
  return Number(value) / Math.pow(10, decimals);
}

export function useCalculateAPR({
  amount,
  multiplier,
  stakingTokenAmounts,
  rewardsTokenAmounts,
  isNewStaking,
}: UseFetchAPRParams) {
  const { data: totalWeight } = useGetTotalWeightedStake();
  const { data: rewardsRate } = useGetRewardsRatePerSecond();

  return useQuery({
    queryKey: [
      "calculate-apr",
      {
        totalWeight: totalWeight?.toString(),
        rewardsRate: rewardsRate?.toString(),
        amount: amount.toString(),
        multiplier: multiplier.toString(),
        stakingTokenAmounts: stakingTokenAmounts.toString(),
        rewardsTokenAmounts: rewardsTokenAmounts.toString(),
        isNewStaking,
      },
    ],
    queryFn: () => {
      if (!totalWeight || !rewardsRate) {
        return 0;
      }

      // Convert all values to numbers with proper decimals
      const amountNum = toNumber(amount, 18); // staking token has 18 decimals
      const multiplierNum = toNumber(multiplier, 4); // multiplier has 4 decimals
      const totalWeightNum = toNumber(totalWeight, 9); // total weight has 9 decimals
      const rewardsRateNum = toNumber(rewardsRate, 9); // rewards rate has 9 decimals

      // Convert price amounts to numbers
      const stakingTokenPriceNum =
        toNumber(stakingTokenAmounts[0], 18) /
        toNumber(stakingTokenAmounts[1], 9);
      const rewardsTokenPriceNum =
        toNumber(rewardsTokenAmounts[0], 18) /
        toNumber(rewardsTokenAmounts[1], 9);

      // Calculate weighted staked amount
      const weightedStakedAmount = amountNum * multiplierNum;

      // Calculate yearly rewards
      const yearlyRewards = rewardsRateNum * ONE_YEAR_IN_SECONDS;
      const rewardPerToken = yearlyRewards / totalWeightNum;

      // Calculate yearly payout for vault
      const yearlyPayout =
        weightedStakedAmount * rewardPerToken * rewardsTokenPriceNum;

      // Calculate user's investment
      const userInvestment = amountNum * stakingTokenPriceNum;

      // Calculate and return APY percentage
      const apy = yearlyPayout / userInvestment;
      return apy;
    },
    enabled: !!totalWeight && !!rewardsRate,
  });
}
