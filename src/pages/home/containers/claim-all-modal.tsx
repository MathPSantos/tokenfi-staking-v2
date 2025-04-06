import { useState } from "react";
import { formatUnits } from "viem";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatToken } from "@/lib/utils";
import { useGetRewardsToken } from "@/services/staking/get-rewards-token";
import { useClaimStakeRewards } from "@/services/staking/claim-stake-rewards";

type ClaimAllModalProps = {
  stakes: {
    rewards: bigint;
    chainId: number;
  }[];
};

export function ClaimAllModal({ stakes }: ClaimAllModalProps) {
  const { data: rewardsToken } = useGetRewardsToken({
    chainId: stakes[0].chainId,
  });

  const { mutateAsync: claimRewardsAsync } = useClaimStakeRewards();

  const [open, setOpen] = useState(false);
  const [isClaimming, setIsClaimming] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalRewards = stakes.reduce((acc, stake) => acc + stake.rewards, 0n);
  const totalRewardsFormatted = formatToken.format(
    Number(formatUnits(totalRewards, rewardsToken?.decimals || 9))
  );

  const handleConfirm = async () => {
    try {
      setIsClaimming(true);
      for (let i = 0; i < stakes.length; i++) {
        await claimRewardsAsync({
          chainId: stakes[i].chainId,
          stakeIndex: i,
        });
        if (i < stakes.length - 1) {
          setCurrentIndex(i + 1);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaimming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          Claim All {totalRewardsFormatted} {rewardsToken?.symbol}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim All Rewards</DialogTitle>
          <DialogDescription>
            This will execute multiple transactions to claim rewards from all
            your stakes. Each stake will be processed one by one.
            {currentIndex > 0 && (
              <div className="mt-2">
                Processing stake {currentIndex} of {stakes.length}...
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isClaimming}>
            {isClaimming
              ? `Claiming ${currentIndex + 1} of ${stakes.length}...`
              : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
