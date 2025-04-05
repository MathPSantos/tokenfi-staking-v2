import {
  getGasPrice,
  getWalletClient,
  readContract,
  switchChain,
  waitForTransactionReceipt,
  WriteContractParameters,
} from "@wagmi/core";
import {
  Abi,
  Address,
  CallParameters,
  ContractFunctionArgs,
  ContractFunctionName,
  erc20Abi,
  EstimateContractGasParameters,
} from "viem";

import { NetworkId, wagmiAdapter } from "./app-kit";
import { publicClient } from "./viem";

const { wagmiConfig } = wagmiAdapter;

export function calculateBigIntMargin(value: bigint, margin = 1000n): bigint {
  return (value * (10000n + margin)) / 10000n;
}

export async function writeContractAndWaitForReceipt<
  TAbi extends Abi | unknown[],
  functionName extends ContractFunctionName<TAbi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<
    TAbi,
    "nonpayable" | "payable",
    functionName
  >
>(
  contract: {
    abi: TAbi;
    account?: string;
    address: string;
    args?: args;
    chainId?: number;
    functionName: functionName;
    value?: bigint;
  } | null,
  overrides: Omit<CallParameters, "chain" | "data" | "to"> & {
    margin?: bigint;
  } = {}
) {
  try {
    if (!contract) throw new Error("No valid contract provided");

    const _account = contract.account as Address | undefined;
    const walletClient = await getWalletClient(wagmiConfig, {
      account: _account,
      chainId: contract.chainId,
    });
    if (!walletClient) throw new Error("No wallet client found");

    const _chainId = contract.chainId as NetworkId | undefined;
    const _address = contract.address as Address;
    const { gas: _gas, ...overrides_ } = overrides;
    let gas = _gas;

    const gasPrice = await getGasPrice(wagmiConfig, { chainId: _chainId });

    if (!gas) {
      try {
        gas = await publicClient({ chainId: _chainId }).estimateContractGas({
          abi: contract.abi,
          address: _address,
          functionName: contract.functionName,
          account: walletClient.account,
          args: contract.args,
          value: contract.value,
          gasPrice,
          ...overrides_,
        } as unknown as EstimateContractGasParameters);
      } catch (err) {
        console.error(err);
      }
    }

    const hash = await walletClient.writeContract({
      abi: contract.abi,
      address: _address,
      functionName: contract.functionName,
      account: walletClient.account,
      args: contract.args,
      gasPrice,
      gas: gas ? calculateBigIntMargin(gas, overrides_.margin) : undefined,
      value: contract.value,
    } as unknown as WriteContractParameters);
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId: _chainId,
      confirmations: 1,
    });

    return { hash, receipt };
  } catch (error) {
    console.error("Error writing contract", error);
    throw error;
  }
}

export async function approveAllowance({
  user,
  tokenAddress,
  transferValue,
  spenderAddress,
  chainId,
}: {
  user?: string;
  tokenAddress: string;
  transferValue: bigint;
  spenderAddress: string;
  chainId: number;
}) {
  const _user = user as Address | undefined;
  const _spenderAddress = spenderAddress as Address;
  const _contract = {
    abi: erc20Abi,
    address: tokenAddress as Address,
    chainId: chainId as NetworkId | undefined,
  } as const;

  const walletClient = await getWalletClient(wagmiConfig, {
    account: _user,
    chainId: _contract.chainId,
  });

  if (!!chainId && chainId !== walletClient.chain.id) {
    await walletClient.switchChain({ id: chainId });
  }

  const allowance = await readContract(wagmiConfig, {
    ..._contract,
    functionName: "allowance",
    args: [walletClient.account.address, _spenderAddress],
  });

  if (allowance < transferValue) {
    if (allowance !== BigInt(0)) {
      await writeContractAndWaitForReceipt({
        ..._contract,
        functionName: "approve",
        args: [_spenderAddress, BigInt(0)],
      });
    }

    await writeContractAndWaitForReceipt({
      ..._contract,
      functionName: "approve",
      args: [_spenderAddress, transferValue],
    });
  }
}

export async function switchUserChain({
  account,
  chainId,
}: {
  chainId: number;
  account?: string;
}) {
  const _account = account as Address | undefined;
  const _chainId = chainId as NetworkId;
  const walletClient = await getWalletClient(wagmiConfig, {
    account: _account,
  });

  if (!walletClient) throw new Error("No wallet client found");

  if (walletClient.chain.id === chainId) return;

  return switchChain(wagmiConfig, { chainId: _chainId });
}
