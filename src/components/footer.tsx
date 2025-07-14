import { AprModal } from "./apr-modal";
import { CopyContractAddress } from "./copy-contract-address";
import { TotalValueLocked } from "./total-value-locked";

export function Footer() {
  return (
    <footer className="shrink-0 ">
      <div className="border-t max-w-(--container-width) flex items-center justify-between gap-4 mx-auto py-2 px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} TokenFi. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <AprModal />
          <TotalValueLocked />
          <CopyContractAddress />
        </div>
      </div>
    </footer>
  )
}