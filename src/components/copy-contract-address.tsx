import { TOKENFI_STAKING_POOL_CONTRACT_ADDRESS } from "@/lib/constants"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-clipboard"
import { shortenAddress } from "@/lib/utils"
import { CopyIcon, CheckIcon } from "lucide-react"
import { ChainLogo } from "./ui/chain-logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function CopyContractAddress() {
  const { copy, isCopy } = useCopyToClipboard()
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="cursor-pointer px-2.5 h-8 transition-colors hover:bg-muted text-sm font-medium flex items-center gap-1.5 rounded-lg"
          onClick={() => copy(TOKENFI_STAKING_POOL_CONTRACT_ADDRESS)}
        >
          <div className="flex items-center -space-x-1 *:rounded-full *:size-4 *:ring-1 *:ring-background">
            <ChainLogo chainId={1} />
            <ChainLogo chainId={56} />
          </div>
          {shortenAddress(TOKENFI_STAKING_POOL_CONTRACT_ADDRESS)}
          {isCopy ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy contract address</p>
      </TooltipContent>
    </Tooltip>
  )
}