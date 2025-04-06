import { useQuery } from "@tanstack/react-query";
import { readContract, readContracts } from "@wagmi/core";
import { isAddress } from "viem";

import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";
import { StakingPoolContract } from "@/lib/contracts";
import { wagmiAdapter } from "@/lib/packages/app-kit";

export function useListStakesByUserAddress({
  user,
  chainId,
}: {
  user?: string;
  chainId: number;
}) {
  return useQuery({
    queryKey: ["get-user-stakes", { user, chainId }],
    queryFn: async () => {
      if (!user || !isAddress(user)) {
        throw new Error("Invalid user address");
      }

      const stakes = await readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        functionName: "getUserStakes",
        args: [user],
        chainId,
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
              chainId,
            } as const)
        ),
      });

      return stakes.map((stake, index) => ({
        ...stake,
        rewards: rewards[index],
        chainId,
      }));
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
  });
}

export function useListAllStakesByUserAddress({ user }: { user?: string }) {
  const {
    data: bscStakes,
    isPending: isBscPending,
    isError: isBscError,
    error: bscError,
  } = useListStakesByUserAddress({ user, chainId: 56 });
  const {
    data: ethStakes,
    isPending: isEthPending,
    isError: isEthError,
    error: ethError,
  } = useListStakesByUserAddress({ user, chainId: 1 });

  const isPending = isBscPending || isEthPending;
  const isError = isBscError || isEthError;
  const error = isBscError ? bscError : ethError;

  return {
    data: [...(bscStakes || []), ...(ethStakes || [])],
    isPending,
    isError,
    error,
  };
}
