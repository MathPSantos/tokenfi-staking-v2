import { createAppKit } from "@reown/appkit/react";
import { bsc, mainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ReactNode } from "react";

import { metadata, projectId, wagmiAdapter } from "@/lib/packages/app-kit";
import { Footer } from "./footer";

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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-svh [--container-width:1152px] overflow-y-scroll flex flex-col">
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
