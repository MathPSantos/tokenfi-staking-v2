import { useQuery } from "@tanstack/react-query";
import { readContract, readContracts } from "@wagmi/core";
import { parseUnits } from "viem";

import {
  UNISWAP_V2_ROUTER_CONTRACT_ADDRESS,
  TOKENFI_STAKING_TOKEN_DECIMALS,
  TOKENFI_REWARD_TOKEN_DECIMALS,
} from "@/lib/constants";
import { UniswapV2Router01Contract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";

import { useGetTotalWeightedStake } from "./get-total-weighted-stake";
import { useGetRewardsRatePerSecond } from "./get-rewards-rate-per-second";
import { useGetRewardsTokenAddress } from "./get-rewards-token-address";
import { useGetStakingTokenAddress } from "./get-staking-token-address";

type UseFetchAPRParams = {
  amount: bigint;
  multiplier: bigint;
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
  isNewStaking,
}: UseFetchAPRParams) {
  const { data: totalWeight } = useGetTotalWeightedStake();
  const { data: rewardsRate } = useGetRewardsRatePerSecond();
  const { data: routerTokenAmounts } = useRouterTokenAmounts();

  const stakingTokenAmounts = routerTokenAmounts?.stakingTokenAmounts;
  const rewardsTokenAmounts = routerTokenAmounts?.rewardsTokenAmounts;

  return useQuery({
    queryKey: [
      "calculate-apr",
      {
        totalWeight: totalWeight?.toString(),
        rewardsRate: rewardsRate?.toString(),
        amount: amount.toString(),
        multiplier: multiplier.toString(),
        stakingTokenAmounts: stakingTokenAmounts?.toString(),
        rewardsTokenAmounts: rewardsTokenAmounts?.toString(),
        isNewStaking,
      },
    ],
    queryFn: () => {
      if (
        !totalWeight ||
        !rewardsRate ||
        !stakingTokenAmounts ||
        !rewardsTokenAmounts
      ) {
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

function useRouterTokenAmounts() {
  const { data: stakingToken } = useGetStakingTokenAddress();
  const { data: rewardsToken } = useGetRewardsTokenAddress();

  return useQuery({
    queryKey: ["router-token-amounts", { stakingToken, rewardsToken }],
    queryFn: async () => {
      if (!stakingToken || !rewardsToken) {
        throw new Error("Invalid token addresses");
      }

      const weth = await readContract(wagmiAdapter.wagmiConfig, {
        abi: UniswapV2Router01Contract.abi,
        address: UNISWAP_V2_ROUTER_CONTRACT_ADDRESS,
        functionName: "WETH",
      });

      const contract = {
        abi: UniswapV2Router01Contract.abi,
        address: UNISWAP_V2_ROUTER_CONTRACT_ADDRESS,
        functionName: "getAmountsIn",
      } as const;

      const data = await readContracts(wagmiAdapter.wagmiConfig, {
        allowFailure: false,
        contracts: [
          {
            ...contract,
            args: [
              parseUnits("1", TOKENFI_STAKING_TOKEN_DECIMALS),
              [weth, stakingToken],
            ],
          },
          {
            ...contract,
            args: [
              parseUnits("1", TOKENFI_REWARD_TOKEN_DECIMALS),
              [weth, rewardsToken],
            ],
          },
        ],
      });

      return { stakingTokenAmounts: data[0], rewardsTokenAmounts: data[1] };
    },
    enabled: !!stakingToken && !!rewardsToken,
  });
}
