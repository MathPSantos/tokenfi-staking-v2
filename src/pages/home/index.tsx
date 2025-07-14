import { useAppKitAccount } from "@reown/appkit/react";
import { useMemo } from "react";

import { ConnectButton } from "@/components/connect-button";
import { useListAllStakesByUserAddress } from "@/services/staking/list-stakes-by-user-address";
import { CreateStakeModal } from "@/components/create-stake-modal";

import { StakeCard } from "./containers/stake-card";
import { ClaimAllModal } from "./containers/claim-all-modal";

export function HomePage() {
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const { data: stakes, isPending } = useListAllStakesByUserAddress({
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
    <div className="flex-1 w-full max-w-(--container-width) mx-auto px-4">
      <div className="flex items-center gap-2 py-3">
        <strong className="block me-auto text-sm font-semibold">
          TokenFi Helpers
        </strong>
        <ConnectButton />
      </div>
      <div className="py-8 space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold me-auto">Your stakings</h1>
          {state === "has-stakes" && (
            <ClaimAllModal stakes={stakes ?? []} />
          )}
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {stakes?.map((stake, index) => (
                  <StakeCard
                    key={`stake-${index}`}
                    stake={stake}
                    index={index}
                  />
                ))}
              </div>
            ),
          }[state]
        }
      </div>
    </div>
  );
}
