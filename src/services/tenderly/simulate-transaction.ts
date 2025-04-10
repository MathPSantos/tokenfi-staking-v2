import { useMutation } from "@tanstack/react-query";

import {
  getTenderlySimulationUrl,
  TENDERLY_ACCOUNT_SLUG,
  TENDERLY_API_KEY,
  TENDERLY_API_SIMULATE_URL,
  TENDERLY_PROJECT_SLUG,
} from "@/lib/packages/tenderly";
import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants";

type TenderlySimulateTransactionParams = {
  chainId: number;
  blockNumber: bigint;
  gasPrice: bigint;
  from: string;
  to: string;
  input: string;
};

export function useTenderlySimulateTransaction() {
  return useMutation({
    mutationFn: async (tx: TenderlySimulateTransactionParams) => {
      const transaction = {
        from: tx.from,
        to: TOKENFI_STAKING_POOL_CONTRACT_ADDRESS,
        input: tx.input,
        network_id: tx.chainId?.toString() ?? "1",
        block_number: Number(tx.blockNumber),
        gas_price: tx.gasPrice?.toString() ?? "0",
        save: true,
        save_if_fails: true,
        simulation_type: "full",
        source: "rabby-wallet",
      };

      const headers = {
        "Content-Type": "application/json",
        "X-Access-Key": TENDERLY_API_KEY,
      };

      const data = await fetch(TENDERLY_API_SIMULATE_URL, {
        method: "POST",
        body: JSON.stringify(transaction),
        headers,
      });

      if (!data.ok) {
        throw new Error("Failed to simulate transaction");
      }

      const result = (await data.json()) as { simulation: { id: string } };

      if (result.simulation.id) {
        await fetch(
          `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulations/${result.simulation.id}/share`,
          {
            method: "POST",
            headers,
          }
        );
      }

      return {
        url: getTenderlySimulationUrl(result.simulation.id),
        ...result,
      };
    },
  });
}
