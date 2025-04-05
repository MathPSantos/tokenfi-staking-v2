import { zodResolver } from "@hookform/resolvers/zod";
import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { erc20Abi, formatUnits } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { z } from "zod";

import { useGetDurationThresholds } from "@/services/constants-multiplier/get-duration-thresholds";
import { useGetStakingTokenAddress } from "@/services/staking/get-staking-token-address";
import { parseDuration } from "@/lib/utils";
import { useCreateStake } from "@/services/staking/create-stake";

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
  amount: z.coerce.bigint().min(1n, "Amount is required"),
  duration: z.coerce.bigint(),
});

type CreateStakeFormData = z.infer<typeof formSchema>;

export function CreateStakeModal() {
  const account = useAppKitAccount({ namespace: "eip155" });
  const [open, onOpenChange] = useState(false);

  const { data: durations } = useGetDurationThresholds();
  const { data: stakeTokenAddress } = useGetStakingTokenAddress();
  const { data: stakeTokenDecimals } = useReadContract({
    address: stakeTokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });
  const { data: balance } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: erc20Abi,
        address: stakeTokenAddress,
        functionName: "balanceOf",
        args: [account.address as `0x${string}`],
      },
      {
        abi: erc20Abi,
        address: stakeTokenAddress,
        functionName: "symbol",
      },
    ],
  });
  const { mutate: createStake, isPending, error } = useCreateStake();

  console.log({ error });

  const form = useForm<CreateStakeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0n,
      duration: durations?.[0]?.threshold,
    },
  });

  const onSubmit = (data: CreateStakeFormData) => {
    createStake(
      {
        amount: data.amount,
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <BigIntInput
                      inputMode="decimal"
                      placeholder="Enter amount"
                      maxDecimals={stakeTokenDecimals ?? 9}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {balance && (
                    <p className="text-sm text-muted-foreground">
                      Available:{" "}
                      {formatUnits(balance[0], stakeTokenDecimals ?? 9)}{" "}
                      {balance[1]}
                    </p>
                  )}
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
                      value={field.value.toString()}
                      onValueChange={(value) => {
                        field.onChange(BigInt(value));
                      }}
                    >
                      <SelectTrigger className="w-full" disabled={!durations}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations?.map((duration) => {
                          const parsedDuration = parseDuration(
                            duration.threshold
                          );

                          if (!parsedDuration) return null;

                          const label = `${parsedDuration.value} ${parsedDuration.label}`;

                          return (
                            <SelectItem
                              key={duration.threshold.toString()}
                              value={duration.threshold.toString()}
                            >
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
