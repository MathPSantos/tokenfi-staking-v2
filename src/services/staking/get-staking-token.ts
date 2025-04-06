import { useQuery } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { erc20Abi } from "viem";

import { wagmiAdapter } from "@/lib/packages/app-kit";

import { useGetStakingTokenAddress } from "./get-staking-token-address";

export function useGetStakingToken() {
  const { data: stakingTokenAddress } = useGetStakingTokenAddress();

  return useQuery({
    queryKey: ["staking-token", { stakingTokenAddress }],
    queryFn: async () => {
      if (!stakingTokenAddress) {
        throw new Error("Staking token address not found");
      }

      const [name, symbol, decimals] = await readContracts(
        wagmiAdapter.wagmiConfig,
        {
          allowFailure: false,
          contracts: [
            {
              abi: erc20Abi,
              address: stakingTokenAddress,
              functionName: "name",
            },
            {
              abi: erc20Abi,
              address: stakingTokenAddress,
              functionName: "symbol",
            },
            {
              abi: erc20Abi,
              address: stakingTokenAddress,
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
    enabled: !!stakingTokenAddress,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
