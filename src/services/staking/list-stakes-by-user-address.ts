import { useQuery } from "@tanstack/react-query";
import { readContract, readContracts } from "@wagmi/core";
import { isAddress } from "viem";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";

export function useListStakesByUserAddress({ user }: { user?: string }) {
  return useQuery({
    queryKey: ["get-user-stakes", { user }],
    queryFn: async () => {
      if (!user || !isAddress(user)) {
        throw new Error("Invalid user address");
      }

      const stakes = await readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "getUserStakes",
        args: [user],
      });

      const rewards = await readContracts(wagmiAdapter.wagmiConfig, {
        allowFailure: false,
        contracts: stakes.map(
          (_, index) =>
            ({
              abi: StakingPoolContract.abi,
              address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
              functionName: "getUserRewards",
              args: [user, index],
            } as const)
        ),
      });

      return stakes.map((stake, index) => ({
        ...stake,
        rewards: rewards[index],
      }));
    },
    enabled: !!user,
  });
}
