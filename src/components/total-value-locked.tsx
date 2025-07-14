import { ChainLogo } from "./ui/chain-logo";
import { useGetStakingToken } from "@/services/staking/get-staking-token";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { wagmiAdapter } from "@/lib/packages/app-kit";
import { StakingPoolContract, UniswapV2Router01Contract } from "@/lib/contracts";
import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS, UNISWAP_V2_ROUTER_ADDRESS, USDC_ADDRESS } from "@/lib/constants";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { Skeleton } from "./ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Button } from "./ui/button";
import { useMemo } from "react";
import { CoinsIcon } from "lucide-react";

const formatUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const formatUsdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
})

export function TotalValueLocked() {
  const { data: tvlEth } = useGetTotalValueLocked({ chainId: 1 })
  const { data: tvlBsc } = useGetTotalValueLocked({ chainId: 56 })

  const total = useMemo(() => {
    if (!tvlEth || !tvlBsc) return 0
    return Number(tvlEth.totalUSD) + Number(tvlBsc.totalUSD)
  }, [tvlEth, tvlBsc])
  
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>
        <Button variant="ghost" size="sm">
          <CoinsIcon />
          {total > 0 ? <span>{formatUsdCompact.format(total)}</span> : <Skeleton className="h-4 w-12" />}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="max-w-[220px] w-fit p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <ChainLogo chainId={1} className="size-4" />
          <span className="text-sm">{formatUsd.format(Number(tvlEth?.totalUSD))}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ChainLogo chainId={56} className="size-4" />
          <span className="text-sm">{formatUsd.format(Number(tvlBsc?.totalUSD))}</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}


type GetTotalValueLockedProps = {
  chainId: number;
}

function useGetTotalValueLocked({ chainId }: GetTotalValueLockedProps) {
  const { data: stakingToken } = useGetStakingToken({ chainId })

  return useQuery({
    queryKey: ["total-value-locked", { chainId }],
    queryFn: async () => {
      if (!stakingToken) throw new Error("Staking token not found");

      const routerAddress: `0x${string}` =
        UNISWAP_V2_ROUTER_ADDRESS[chainId as keyof typeof UNISWAP_V2_ROUTER_ADDRESS];
      const usdAddress = USDC_ADDRESS[chainId as keyof typeof USDC_ADDRESS];
      const usdDecimals = await readContract(wagmiAdapter.wagmiConfig, {
        abi: erc20Abi,
        address: usdAddress,
        chainId,
        functionName: "decimals",
      })

      const weth = await readContract(wagmiAdapter.wagmiConfig, {
        abi: UniswapV2Router01Contract.abi,
        address: routerAddress,
        chainId,
        functionName: "WETH",
      })

      const [, , tokenPrice] = await readContract(wagmiAdapter.wagmiConfig, {
        abi: UniswapV2Router01Contract.abi,
        address: routerAddress,
        chainId,
        functionName: "getAmountsOut",
        args: [parseUnits("1", stakingToken.decimals), [stakingToken.address, weth, usdAddress]],
      }) 

      const totalValueLocked = await readContract(wagmiAdapter.wagmiConfig, {
        abi: StakingPoolContract.abi,
        address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        chainId,
        functionName: "totalStaked",
      })

      const usd = formatUnits(tokenPrice * totalValueLocked, stakingToken.decimals + usdDecimals)
      const [value, decimals] = usd.split(".")

      return {
        total: totalValueLocked,
        totalUSD: `${value}.${decimals.slice(0, 2)}`
      }
    },
    enabled: !!stakingToken,
    throwOnError: err => {
      console.error(err)
      return false
    },
  })
}
