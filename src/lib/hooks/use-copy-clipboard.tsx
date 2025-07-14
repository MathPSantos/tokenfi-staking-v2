import { useState } from 'react'

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<boolean> // Return success

export function useCopyToClipboard(): {
  copiedText: CopiedValue
  copy: CopyFn
  isCopy: boolean
} {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)
  const [isCopy, setIsCopy] = useState(false)

  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setIsCopy(true)
      setTimeout(() => {
        setIsCopy(false)
      }, 1500)

      return true
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }

  return {
    copiedText,
    copy,
    isCopy,
  }
}