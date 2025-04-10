import { createAppKit } from "@reown/appkit";
import { bsc, mainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ReactNode } from "react";

import { metadata, projectId, wagmiAdapter } from "@/lib/packages/app-kit";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [bsc, mainnet],
  projectId,
  metadata,
  features: {
    analytics: false,
    swaps: false,
    email: false,
    history: false,
    receive: false,
    send: false,
    onramp: false,
    socials: false,
  },
  themeMode: "light",
});

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
