import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bsc, mainnet } from "viem/chains";

export const projectId = "f8b7f2edf12cced5477b8a2fa69fbbb4";

export const metadata = {
  name: "TokenFi Airdrop",
  description: "",
  url: "https://example.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const networks = [bsc, mainnet];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

export type NetworkId = (typeof networks)[number]["id"];
