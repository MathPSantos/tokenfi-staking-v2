import { zodResolver } from "@hookform/resolvers/zod";
import { useAppKitAccount } from "@reown/appkit/react";
import { ZapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { erc20Abi, formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { z } from "zod";

import { useGetDurationThresholds } from "@/services/constants-multiplier/get-duration-thresholds";
import { useGetStakingTokenAddress } from "@/services/staking/get-staking-token-address";
import { formatPercentage, formatToken, parseDuration } from "@/lib/utils";
import { useCreateStake } from "@/services/staking/create-stake";
import { useGetStakingToken } from "@/services/staking/get-staking-token";
import { useAPRForDuration } from "@/lib/hooks/use-apr-for-duration";
import { useGetStakingProgramEndDate } from "@/services/staking/get-staking-program-end-date";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { BigIntInput } from "./ui/bigint-input";

const formSchema = z.object({
  chainId: z.coerce.number(),
  amount: z.coerce.bigint().min(1n, "Amount is required"),
  duration: z.coerce.bigint(),
});

type CreateStakeFormData = z.infer<typeof formSchema>;

export function CreateStakeModal() {
  const account = useAppKitAccount({ namespace: "eip155" });
  const [open, onOpenChange] = useState(false);

  const form = useForm<CreateStakeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0n,
      chainId: 56,
    },
  });

  const [chainId, duration] = useWatch({
    control: form.control,
    name: ["chainId", "duration"],
  });

  const { data: endDateTimestamp } = useGetStakingProgramEndDate({ chainId });
  const { data: durations } = useGetDurationThresholds({ chainId });
  const { data: stakeTokenAddress } = useGetStakingTokenAddress({ chainId });
  const { data: stakeToken } = useGetStakingToken({ chainId });
  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: stakeTokenAddress,
    functionName: "balanceOf",
    chainId,
    args: [account.address as `0x${string}`],
  });
  const { mutate: createStake, isPending } = useCreateStake({ chainId });

  const formattedBalance = useMemo(() => {
    if (!balance || !stakeToken?.decimals) return "0";

    return formatToken.format(
      Number(formatUnits(balance, stakeToken?.decimals ?? 9))
    );
  }, [balance, stakeToken?.decimals]);

  const isDurationAfterEndDate = useMemo(() => {
    if (!endDateTimestamp || !duration) return false;

    const endStakingPeriod = new Date().getTime() + Number(duration * 1000n);

    return endStakingPeriod > Number(endDateTimestamp * 1000n);
  }, [endDateTimestamp, duration]);

  const endStakingProgramDate = useMemo(() => {
    if (!endDateTimestamp) return null;

    return new Date(Number(endDateTimestamp * 1000n)).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [endDateTimestamp]);

  const onSubmit = (data: CreateStakeFormData) => {
    createStake(
      {
        amount: data.amount,
        chainId: data.chainId,
        duration: data.duration,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>Create Stake</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stake</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chainId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="56">BSC</SelectItem>
                        <SelectItem value="1">Ethereum</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <BigIntInput
                      inputMode="decimal"
                      placeholder="Enter amount"
                      maxDecimals={stakeToken?.decimals ?? 9}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Available: {formattedBalance} {stakeToken?.symbol}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString() ?? ""}
                      onValueChange={(value) => {
                        field.onChange(BigInt(value));
                      }}
                    >
                      <SelectTrigger className="w-full" disabled={!durations}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations?.map((duration) => {
                          return (
                            <DurationItem
                              key={duration.threshold.toString()}
                              duration={duration}
                              chainId={chainId}
                            />
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isDurationAfterEndDate && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                <p>
                  <span className="font-medium">
                    Staking Beyond the Reward Period Selected
                  </span>
                  <br />
                  After {endStakingProgramDate}, you will no longer accumulate
                  rewards, but your funds will remain locked until the staking
                  period ends. You can still earn points and participate in the
                  Supercharger program for TokenFi.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating stake..." : "Create Stake"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

type DurationItemProps = {
  duration: { threshold: bigint };
  chainId: number;
};

const DurationItem = ({ duration, chainId }: DurationItemProps) => {
  const { data: apr } = useAPRForDuration({
    threshold: duration.threshold,
    chainId,
  });
  const parsedDuration = parseDuration(duration.threshold);

  if (!parsedDuration) return null;

  const label = `${parsedDuration.value} ${parsedDuration.label}`;

  return (
    <SelectItem value={duration.threshold.toString()}>
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {!!apr && (
          <span className="rounded-full text-xs text-green-600 bg-green-100 px-1.5 h-5 font-semibold flex items-center gap-1">
            <ZapIcon className="size-3 text-green-600 fill-green-600" />
            {formatPercentage.format(apr)}
          </span>
        )}
      </div>
    </SelectItem>
  );
};
