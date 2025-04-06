import { useQuery } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { erc20Abi } from "viem";

import { wagmiAdapter } from "@/lib/packages/app-kit";

import { useGetRewardsTokenAddress } from "./get-rewards-token-address";

export function useGetRewardsToken() {
  const { data: rewardsTokenAddress } = useGetRewardsTokenAddress();

  return useQuery({
    queryKey: ["rewards-token", { rewardsTokenAddress }],
    queryFn: async () => {
      if (!rewardsTokenAddress) {
        throw new Error("Rewards token address not found");
      }

      const [name, symbol, decimals] = await readContracts(
        wagmiAdapter.wagmiConfig,
        {
          allowFailure: false,
          contracts: [
            {
              abi: erc20Abi,
              address: rewardsTokenAddress,
              functionName: "name",
            },
            {
              abi: erc20Abi,
              address: rewardsTokenAddress,
              functionName: "symbol",
            },
            {
              abi: erc20Abi,
              address: rewardsTokenAddress,
              functionName: "decimals",
            },
          ],
        }
      );

      return {
        name,
        symbol,
        decimals,
      };
    },
    enabled: !!rewardsTokenAddress,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
