import { useAppKitAccount } from "@reown/appkit/react";
import { getBlockNumber, getGasPrice } from "@wagmi/core";
import { ExternalLinkIcon } from "lucide-react";
import { ComponentPropsWithoutRef, useCallback, useState } from "react";
import {
  Abi,
  ContractFunctionArgs,
  ContractFunctionName,
  encodeFunctionData,
  EncodeFunctionDataParameters,
} from "viem";

import { TenderlyIcon } from "@/assets/tenderly-icon";
import { useTenderlySimulateTransaction } from "@/services/tenderly/simulate-transaction";
import { wagmiAdapter } from "@/lib/packages/app-kit";

import { Button } from "./button";

type TenderlySimulateButtonProps<
  abi extends Abi,
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>
> = Omit<ComponentPropsWithoutRef<typeof Button>, "children" | "onClick"> & {
  transaction: {
    abi: abi;
    account?: string;
    address: string;
    args?: args;
    chainId?: number;
    functionName: functionName;
    value?: bigint;
  } | null;
};

export function TenderlySimulateButton<
  abi extends Abi,
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>
>({
  transaction,
  ...props
}: TenderlySimulateButtonProps<abi, functionName, args>) {
  const [isPending, setIsPending] = useState(false);
  const { data, mutateAsync } = useTenderlySimulateTransaction();
  const account = useAppKitAccount({ namespace: "eip155" });

  const handleClick = useCallback(async () => {
    try {
      setIsPending(true);
      if (!transaction) return;
      const [blockNumber, gasPrice] = await Promise.all([
        getBlockNumber(wagmiAdapter.wagmiConfig),
        getGasPrice(wagmiAdapter.wagmiConfig),
      ]);
      await mutateAsync({
        chainId: transaction.chainId ?? 1,
        blockNumber: blockNumber,
        gasPrice: gasPrice,
        from: transaction.account ?? account?.address ?? "",
        to: transaction.address,
        input: encodeFunctionData({
          abi: transaction.abi,
          functionName: transaction.functionName,
          args: transaction.args,
        } as EncodeFunctionDataParameters),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }, [transaction, mutateAsync, account?.address]);

  return (
    <div className="@container/grid grid grid-cols-[repeat(auto-fit,minmax(min(100%,148px),1fr))] gap-2">
      <Button
        {...props}
        variant="secondary"
        disabled={isPending}
        onClick={handleClick}
        className="@container/simulate-button"
      >
        <TenderlyIcon className="size-4" />
        {isPending ? (
          "Simulating..."
        ) : (
          <span className="">
            Simulate{" "}
            <span className="hidden @3xs/simulate-button:inline">
              on Tenderly
            </span>
          </span>
        )}
      </Button>
      {data?.url && (
        <Button asChild variant="secondary">
          <a href={data.url} target="_blank" rel="nofollow noreferrer">
            Simulation Link <ExternalLinkIcon className="size-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
