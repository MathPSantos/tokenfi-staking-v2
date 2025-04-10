import {
  PiggyBankIcon,
  HandCoinsIcon,
  ZapIcon,
  EllipsisVerticalIcon,
  BanknoteArrowDownIcon,
} from "lucide-react";
import { SVGAttributes, useCallback, useMemo, useState } from "react";
import { formatUnits } from "viem";

import { Button } from "@/components/ui/button";
import { formatPercentage, formatToken, parseDuration } from "@/lib/utils";
import { useGetMultiplierByDuration } from "@/services/constants-multiplier/get-multiplier-by-duration";
import { useCalculateAPR } from "@/services/staking/calculate-apr";
import { useGetRewardsToken } from "@/services/staking/get-rewards-token";
import { useGetStakingToken } from "@/services/staking/get-staking-token";
import { useClaimStakeRewards } from "@/services/staking/claim-stake-rewards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnstakeModal } from "@/components/unstake-modal";
import { ChainLogo } from "@/components/ui/chain-logo";
import { TenderlySimulateButton } from "@/components/ui/tenderly-simulate-button";
import { StakingPoolContract } from "@/lib/contracts";
import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";

type StakeCardProps = {
  stake: {
    stakedAmount: bigint;
    minimumStakeTimestamp: bigint;
    duration: bigint;
    rewardPerTokenPaid: bigint;
    rewards: bigint;
    chainId: number;
  };
  index: number;
};

export function StakeCard({ stake, index }: StakeCardProps) {
  const [open, setOpen] = useState(false);
  const { data: stakingToken } = useGetStakingToken({ chainId: stake.chainId });
  const { data: rewardsToken } = useGetRewardsToken({
    chainId: stake.chainId,
  });
  const { data: multiplier } = useGetMultiplierByDuration({
    duration: stake.duration,
    chainId: stake.chainId,
  });
  const { data: apr } = useCalculateAPR({
    amount: stake.stakedAmount,
    multiplier: multiplier || 0n,
    isNewStaking: false,
    chainId: stake.chainId,
  });

  const { mutate: claimRewards, isPending: isClaimingRewards } =
    useClaimStakeRewards();

  const durationLabel = useMemo(() => {
    const d = parseDuration(stake.duration);
    return d ? `${d.value} ${d.label}` : null;
  }, [stake.duration]);

  const stakingStartDateLabel = useMemo(() => {
    const endDate = Number(stake.minimumStakeTimestamp) * 1000;
    const durationMs = Number(stake.duration) * 1000;
    const startDate = endDate - durationMs;
    return new Date(startDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [stake.minimumStakeTimestamp, stake.duration]);

  const stakingEndDateLabel = useMemo(() => {
    const d = Number(stake.minimumStakeTimestamp) * 1000;
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [stake.minimumStakeTimestamp]);

  const cooldownPeriod = useMemo(() => {
    const today = new Date();
    const endDate = new Date(Number(stake.minimumStakeTimestamp) * 1000);

    if (today >= endDate) {
      return { years: 0, months: 0, days: 0 };
    }

    let years = endDate.getFullYear() - today.getFullYear();
    let months = endDate.getMonth() - today.getMonth();
    let days = endDate.getDate() - today.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }, [stake.minimumStakeTimestamp]);

  const rewards = useMemo(() => {
    return formatToken.format(
      Number(formatUnits(stake.rewards, rewardsToken?.decimals || 9))
    );
  }, [stake.rewards, rewardsToken?.decimals]);

  const staked = useMemo(() => {
    return formatToken.format(
      Number(formatUnits(stake.stakedAmount, stakingToken?.decimals || 9))
    );
  }, [stake.stakedAmount, stakingToken?.decimals]);

  const handleClaimRewards = useCallback(() => {
    claimRewards({ chainId: stake.chainId, stakeIndex: index });
  }, [claimRewards, index, stake.chainId]);

  return (
    <>
      <div className="space-y-6 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <TokenFiLogo className="size-12" />
              <ChainLogo
                chainId={stake.chainId}
                className="size-5 absolute bottom-0.5 -right-1"
              />
            </div>
            <span className="text-sm font-semibold">TOKEN</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <BanknoteArrowDownIcon className="size-4" />
                Unstake funds
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 *:last:text-end">
          <div className="space-y-4">
            <strong className="block font-semibold text-sm">Staked</strong>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <PiggyBankIcon className="size-6" />
              </div>
              <div className="space-y-1 *:block">
                <strong className="text-sm font-semibold">
                  {staked} {stakingToken?.symbol}
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <strong className="block font-semibold text-sm">
              Tokens earned
            </strong>
            <div className="flex items-center justify-end gap-3">
              <div className="size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <HandCoinsIcon className="size-6" />
              </div>
              <div className="space-y-1 *:block">
                <strong className="text-sm font-semibold">
                  {rewards} {rewardsToken?.symbol}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between *:last:text-end">
            <span className="text-sm">Staking period</span>
            <span className="text-sm font-semibold">
              <span className="text-xs me-2 inline-flex items-center gap-1 text-green-500">
                <ZapIcon className="fill-green-500 size-3" />
                APR ~{formatPercentage.format(apr || 0)}
              </span>
              {durationLabel}
            </span>
          </div>
          <div className="flex items-center justify-between *:last:text-end">
            <span className="text-sm">Staking start date</span>
            <span className="text-sm font-semibold">
              {stakingStartDateLabel}
            </span>
          </div>
          <div className="flex items-center justify-between *:last:text-end">
            <span className="text-sm">Staking end date</span>
            <span className="text-sm font-semibold">{stakingEndDateLabel}</span>
          </div>
          <div className="flex items-center justify-between *:last:text-end">
            <span className="text-sm">Network</span>
            <span className="text-sm font-semibold flex items-center gap-1">
              <ChainLogo chainId={stake.chainId} className="size-4" />
              {stake.chainId === 56 ? "BSC" : "ETH"}
            </span>
          </div>
          <div className="flex items-center justify-between *:last:text-end">
            <span className="text-sm">Staked</span>
            <span className="text-sm font-semibold">
              {staked} {stakingToken?.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between *:last:text-end">
            <span className="text-sm">Cooldown period</span>
            <span className="text-sm font-semibold">
              {cooldownPeriod.years} years, {cooldownPeriod.months} months,{" "}
              {cooldownPeriod.days} days
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <TenderlySimulateButton
            transaction={{
              abi: StakingPoolContract.abi,
              functionName: "claimRewards",
              args: [BigInt(index)] as const,
              address: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
              chainId: stake.chainId,
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClaimRewards}
            disabled={isClaimingRewards}
          >
            {isClaimingRewards
              ? "Claiming..."
              : `Claim ${rewards} ${rewardsToken?.symbol}`}
          </Button>
        </div>
      </div>

      <UnstakeModal
        open={open}
        onOpenChange={setOpen}
        stake={stake}
        index={index}
      />
    </>
  );
}

function TokenFiLogo(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_6661_9755)">
        <path
          d="M24 47.999C37.2548 47.999 48 37.2539 48 23.999C48 10.7442 37.2548 -0.000976562 24 -0.000976562C10.7452 -0.000976562 0 10.7442 0 23.999C0 37.2539 10.7452 47.999 24 47.999Z"
          fill="black"
        />
        <path
          d="M27.508 23.4095C27.3448 23.4686 27.1723 23.4408 27.0033 23.4408C24.9416 23.4431 22.8787 23.4408 20.8169 23.4408C20.7486 23.4408 20.6803 23.4338 20.612 23.4408C20.3539 23.4709 20.2288 23.3841 20.2532 23.1004C20.274 22.8643 20.2578 22.6235 20.2578 22.385C20.2578 21.1753 20.2578 19.9656 20.2555 18.7558C20.2555 18.2071 20.3099 18.2766 19.7565 18.2754C17.1322 18.272 14.5078 18.2685 11.8835 18.2708C10.9794 18.2708 10.338 17.92 9.93866 17.0657C9.18157 15.4462 8.37123 13.8521 7.58404 12.2476C7.53195 12.1411 7.47638 12.0346 7.43008 11.9247C7.2136 11.4223 7.39998 11.0865 7.93712 11.0206C8.08877 11.002 8.24389 11.0101 8.3967 11.0101H39.2765C39.4802 11.0101 39.6875 10.987 39.8866 11.0483C40.2836 11.1687 40.4214 11.45 40.2744 11.8378C40.2443 11.9166 40.2014 11.9918 40.1644 12.0682C39.3321 13.7653 38.487 15.4554 37.672 17.1606C37.3027 17.9339 36.6904 18.2627 35.8742 18.265C33.3691 18.2731 30.864 18.2708 28.3589 18.2731H28.0521C27.5046 18.2789 27.5613 18.2071 27.5601 18.7605C27.5578 20.1913 27.5601 21.6221 27.5566 23.0541C27.5566 23.1711 27.5821 23.2938 27.5092 23.4037V23.4084L27.508 23.4095Z"
          fill="white"
        />
        <path
          d="M23.9275 30.719C25.0006 30.719 26.0737 30.7179 27.1468 30.719C27.5462 30.719 27.5532 30.7248 27.5532 31.0941C27.5532 32.9845 27.5532 34.8749 27.5532 36.7642C27.5532 37.1103 27.4663 37.4333 27.3112 37.7459C26.4349 39.5147 25.5667 41.2871 24.6904 43.0559C24.548 43.343 24.4195 43.6625 24.0166 43.6683C23.6114 43.6741 23.4772 43.3604 23.3336 43.071C22.3728 41.1354 21.4154 39.1987 20.4581 37.2608C20.3203 36.9818 20.2647 36.682 20.2647 36.3706C20.2647 34.5994 20.267 32.8282 20.252 31.0582C20.2497 30.7758 20.3458 30.7121 20.6062 30.7144C21.7129 30.7248 22.8208 30.719 23.9275 30.719Z"
          fill="white"
        />
        <path
          d="M27.5628 27.0389C27.5628 25.9658 27.5605 24.8927 27.5628 23.8195C27.5628 23.4595 27.5698 23.4514 27.9205 23.4503C29.8457 23.4468 31.7708 23.4468 33.6959 23.4468C33.7804 23.4468 33.8661 23.4526 33.9506 23.4572C34.4276 23.4803 34.7864 23.823 34.4843 24.4146C33.7503 25.8546 33.0535 27.3144 32.3415 28.7661C32.191 29.0717 32.0336 29.3738 31.8923 29.6829C31.6099 30.3034 31.1017 30.6345 30.4523 30.6716C29.569 30.7213 28.6811 30.6889 27.7955 30.7028C27.5177 30.7074 27.5617 30.5234 27.5605 30.359V27.0377H27.5628V27.0389Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_6661_9755">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
