import { formatUnits } from "viem";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatToken } from "@/lib/utils";
import { useGetRewardsToken } from "@/services/staking/get-rewards-token";
import { useGetStakingToken } from "@/services/staking/get-staking-token";
import { useCalculatePenalty } from "@/services/penalty/calculate-penalty";
import { useGetPenaltyFeeByDuration } from "@/services/penalty/get-penalty-fee-by-duration";
import { useUnstakeFunds } from "@/services/staking/unstake-funds";

import { BigIntInput } from "./ui/bigint-input";
import { Skeleton } from "./ui/skeleton";

type UnstakeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stake: {
    duration: bigint;
    stakedAmount: bigint;
    rewards: bigint;
    minimumStakeTimestamp: bigint;
    chainId: number;
  };
  index: number;
};

function UnstakeModalContent({
  onOpenChange,
  stake,
  index,
}: UnstakeModalProps) {
  const { data: rewardsToken } = useGetRewardsToken({ chainId: stake.chainId });
  const { data: stakingToken } = useGetStakingToken({
    chainId: stake.chainId,
  });
  const [unstakeAmountRaw, setUnstakeAmount] = useState<bigint>(0n);
  const [debouncedUnstakeAmount, setDebouncedUnstakeAmount] =
    useState<bigint>(0n);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnstakeAmount(unstakeAmountRaw);
    }, 500);

    return () => clearTimeout(timer);
  }, [unstakeAmountRaw]);

  const unstakeAmount = debouncedUnstakeAmount;

  const { data: penalty = 0n, isLoading: isCalculatingPenalty } =
    useCalculatePenalty({
      duration: stake.duration,
      stakedAmount: unstakeAmount,
      chainId: stake.chainId,
    });
  const { data: penaltyPercentage = 0n } = useGetPenaltyFeeByDuration({
    duration: stake.duration,
    chainId: stake.chainId,
  });

  const { mutate: unstakeFunds, isPending: isUnstaking } = useUnstakeFunds();

  const stakeAmountFormatted = useMemo(() => {
    return formatToken.format(
      Number(formatUnits(stake.stakedAmount, stakingToken?.decimals || 9))
    );
  }, [stake.stakedAmount, stakingToken?.decimals]);

  const receiveAmountFormatted = useMemo(() => {
    const receiveAmount = unstakeAmount - penalty;

    return formatToken.format(
      Number(formatUnits(receiveAmount, stakingToken?.decimals || 9))
    );
  }, [unstakeAmount, stakingToken?.decimals, penalty]);

  const formattedDueDate = useMemo(() => {
    return new Date(Number(stake.minimumStakeTimestamp) * 1000).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }, [stake.minimumStakeTimestamp]);

  const formattedPenaltyPercentage = useMemo(() => {
    return formatUnits(penaltyPercentage, 2);
  }, [penaltyPercentage]);

  const formattedRewards = useMemo(() => {
    return formatToken.format(
      Number(formatUnits(stake.rewards, rewardsToken?.decimals || 9))
    );
  }, [stake.rewards, rewardsToken?.decimals]);

  const handleMaxClick = useCallback(() => {
    setUnstakeAmount(stake.stakedAmount);
  }, [stake.stakedAmount]);

  const handleUnstake = useCallback(() => {
    unstakeFunds(
      { amount: unstakeAmount, stakeIndex: index, chainId: stake.chainId },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }, [unstakeAmount, index, stake.chainId, unstakeFunds, onOpenChange]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Unstake Tokens</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Early Unstaking Penalty
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  If you unstake your {stakingToken?.symbol} before due time, a{" "}
                  {formattedPenaltyPercentage}% penalty fee* will be applied,
                  and you will lose all Supercharger points for this stake.
                </p>
                <p className="mt-2">
                  Wait until {formattedDueDate} to unstake your{" "}
                  {stakingToken?.symbol} to avoid the{" "}
                  {formattedPenaltyPercentage}% penalty fee.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Amount to Unstake</label>
            <span className="text-sm text-muted-foreground">
              Balance: {stakeAmountFormatted}
            </span>
          </div>
          <div className="flex gap-2">
            <BigIntInput
              value={unstakeAmountRaw}
              onChange={setUnstakeAmount}
              maxDecimals={stakingToken?.decimals || 9}
              placeholder="0"
              inputMode="decimal"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleMaxClick}
              className="whitespace-nowrap"
            >
              Max
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-blue-800">
              REVIEW AND CONFIRMATION
            </h3>
            <div className="space-y-1 text-sm text-blue-700">
              <p>Unstake Date: {formattedDueDate}</p>
              <p>
                {rewardsToken?.symbol} you will get:{" "}
                {isCalculatingPenalty ? (
                  <Skeleton className="inline-block h-4 w-12" />
                ) : (
                  <>
                    {receiveAmountFormatted} {stakingToken?.symbol}
                  </>
                )}
                + {formattedRewards} {rewardsToken?.symbol}
              </p>
              <p className="text-xs italic">
                *The {formattedPenaltyPercentage}% fee applies to your staked
                tokens, not your rewards.
              </p>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleUnstake}
          disabled={
            unstakeAmount <= 0n ||
            unstakeAmount > stake.stakedAmount ||
            isUnstaking
          }
        >
          {isUnstaking ? "Unstaking..." : "Confirm Unstake"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function UnstakeModal({
  open,
  onOpenChange,
  stake,
  index,
}: UnstakeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <UnstakeModalContent
          open={open}
          onOpenChange={onOpenChange}
          stake={stake}
          index={index}
        />
      </DialogContent>
    </Dialog>
  );
}
