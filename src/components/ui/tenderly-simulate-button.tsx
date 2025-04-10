import { useAppKitAccount } from "@reown/appkit/react";
import { getBlockNumber, getGasPrice } from "@wagmi/core";
import { ExternalLinkIcon, Loader2Icon, XCircleIcon } from "lucide-react";
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
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">(
    "idle"
  );
  const { data, mutateAsync } = useTenderlySimulateTransaction();
  const account = useAppKitAccount({ namespace: "eip155" });

  const handleClick = useCallback(async () => {
    if (["pending", "success"].includes(state)) return;

    try {
      setState("pending");
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
      setState("success");
    } catch (error) {
      console.error(error);
      setState("error");
    }
  }, [state, transaction, mutateAsync, account?.address]);

  return (
    <Button
      {...props}
      asChild={state === "success"}
      variant="secondary"
      disabled={state === "pending"}
      onClick={handleClick}
    >
      {
        {
          idle: (
            <>
              <TenderlyIcon className="size-4" />
              Simulate on Tenderly
            </>
          ),
          pending: (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Simulating...
            </>
          ),
          success: (
            <a href={data?.url} target="_blank" rel="nofollow noreferrer">
              View simulation
              <ExternalLinkIcon className="size-4" />
            </a>
          ),
          error: (
            <>
              <XCircleIcon className="size-4" />
              Retry simulation
            </>
          ),
        }[state]
      }
    </Button>
  );
}
