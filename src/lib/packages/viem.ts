import { createPublicClient, fallback, http, PublicClient } from "viem";
import { bsc } from "viem/chains";

import { NetworkId, networks } from "./app-kit";

const PUBLIC_NODES: Record<NetworkId, string[] | readonly string[]> = {
  [56]: [
    ...bsc.rpcUrls.default.http,
    "https://bsc.publicnode.com",
    "https://binance.llamarpc.com",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.binance.org",
  ],
};

export const CLIENT_CONFIG = {
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 6_000,
};

function createViemPublicClients({
  transportSignal,
}: { transportSignal?: AbortSignal } = {}) {
  return networks.reduce((prev, curr) => {
    return {
      ...prev,
      [curr.id]: createPublicClient({
        chain: curr,
        transport: fallback(
          PUBLIC_NODES[curr.id].map((url) =>
            http(url, {
              timeout: 10_000,
              fetchOptions: { signal: transportSignal },
            })
          ),
          { rank: false }
        ),
        ...CLIENT_CONFIG,
      }),
    };
  }, {} as Record<NetworkId, PublicClient>);
}

export const viemClients = createViemPublicClients();

export const publicClient = ({ chainId }: { chainId?: NetworkId }) => {
  if (chainId && viemClients[chainId]) {
    return viemClients[chainId];
  }

  const httpString = chainId ? PUBLIC_NODES[chainId][0] : undefined;

  const chain = networks.find((c) => c.id === chainId);
  return createPublicClient({
    chain,
    transport: http(httpString),
    ...CLIENT_CONFIG,
  });
};
