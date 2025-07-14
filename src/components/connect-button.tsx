import { shortenAddress } from "@/lib/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "./ui/button";
import { WalletIcon } from "lucide-react";

export function ConnectButton() {
  const { open } = useAppKit()
  const account = useAppKitAccount()
  
  if (account.isConnected) {
    return (
      <Button variant="outline" size="sm" onClick={() => open({ view: 'Account' })}	>
        <WalletIcon />
        {shortenAddress(account.address!)}
      </Button>
    )
  }
  
  return (
    <Button size="sm" onClick={() => open({ view: 'Connect' })}>
      Connect wallet
    </Button>
  )
}
