import { useAppKitAccount } from "@reown/appkit/react";
import { useMemo } from "react";
import { formatUnits } from "viem";

import { ConnectButton } from "@/components/connect-button";
import { useListStakesByUserAddress } from "@/services/staking/list-stakes-by-user-address";
import { AprModal } from "@/components/apr-modal";
import { CreateStakeModal } from "@/components/create-stake-modal";

export function HomePage() {
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const { data: stakes, isPending } = useListStakesByUserAddress({
    user: address,
  });

  const state = useMemo<
    "not-connected" | "loading" | "no-stakes" | "has-stakes"
  >(() => {
    if (!isConnected) return "not-connected";
    if (isPending) return "loading";
    if (stakes?.length === 0) return "no-stakes";
    return "has-stakes";
  }, [isConnected, stakes, isPending]);

  return (
    <div className="overflow-y-scroll min-h-svh flex flex-col [--container-width:1152px]">
      <header className="border-b">
        <div className="flex items-center gap-2 max-w-(--container-width) mx-auto py-3 px-4">
          <strong className="block me-auto text-sm font-semibold">
            TokenFi Staking V2
          </strong>
          <AprModal />
          <ConnectButton />
        </div>
      </header>
      <main className="flex-1">
        <section>
          <div className="max-w-(--container-width) mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Your stakings</h1>
              <CreateStakeModal />
            </div>

            {
              {
                "not-connected": (
                  <div className="rounded-lg bg-muted p-4 flex flex-col items-center justify-center gap-3">
                    <p className="text-sm font-semibold text-center text-muted-foreground">
                      Connect your wallet to see your stakings
                    </p>
                    <ConnectButton />
                  </div>
                ),
                loading: <div>Loading...</div>,
                "no-stakes": (
                  <div className="rounded-lg bg-muted p-4 flex flex-col items-center justify-center gap-3">
                    <p className="text-sm font-semibold text-center text-muted-foreground">
                      You don't have any stakes yet
                    </p>
                    <CreateStakeModal />
                  </div>
                ),
                "has-stakes": (
                  <div className="grid grid-cols-1 gap-2">
                    {stakes?.map((stake) => (
                      <div key={stake.stakedAmount.toString()}>
                        {formatUnits(stake.stakedAmount, 9)}
                      </div>
                    ))}
                  </div>
                ),
              }[state]
            }
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="max-w-(--container-width) mx-auto py-6 px-4">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 TokenFi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
