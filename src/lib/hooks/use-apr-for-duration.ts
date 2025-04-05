import { useQuery } from "@tanstack/react-query";
import { readContract, readContracts } from "@wagmi/core";
import { parseUnits } from "viem";

import { useGetMultiplierByDuration } from "@/services/constants-multiplier/get-multiplier-by-duration";
import { useCalculateAPR } from "@/services/staking/calculate-apr";
import {
  TOKENFI_REWARD_TOKEN_DECIMALS,
  TOKENFI_STAKING_TOKEN_DECIMALS,
  UNISWAP_V2_ROUTER_CONTRACT_ADDRESS,
} from "../constants";
import { useGetRewardsTokenAddress } from "@/services/staking/get-rewards-token-address";
import { useGetStakingTokenAddress } from "@/services/staking/get-staking-token-address";

import { wagmiAdapter } from "../packages/app-kit";
import { UniswapV2Router01Contract } from "../contracts";

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

export function useAPRForDuration(threshold: bigint) {
  const { data: routerTokenAmounts } = useRouterTokenAmounts();
  const { data: multiplier } = useGetMultiplierByDuration({
    duration: threshold,
  });

  return useCalculateAPR({
    amount: parseUnits("1", TOKENFI_STAKING_TOKEN_DECIMALS),
    stakingTokenAmounts: routerTokenAmounts?.stakingTokenAmounts || [0n, 0n],
    rewardsTokenAmounts: routerTokenAmounts?.rewardsTokenAmounts || [0n, 0n],
    multiplier: multiplier || 0n,
    isNewStaking: true,
  });
}
