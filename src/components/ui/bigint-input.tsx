import * as React from "react";
import { formatUnits, parseUnits } from "viem";

import { cn } from "@/lib/utils";

import { Input } from "./input";

export type BigIntInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "ref" | "onChange" | "as" | "value"
> & {
  value?: bigint | null;
  maxDecimals?: number;
  onChange?: (value: bigint) => void;
};

export const BigIntInput = React.forwardRef<HTMLInputElement, BigIntInputProps>(
  (
    {
      className,
      maxDecimals = 18,
      onChange,
      value,
      placeholder = "0",
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(() => {
      if (!value) return "";
      return formatUnits(value, maxDecimals);
    });

    React.useEffect(() => {
      setInputValue(value ? formatUnits(value, maxDecimals) : "");
    }, [value, maxDecimals]);

    const enforcer = React.useCallback(
      (newInput: string) => {
        if (newInput === "" || inputRegex.test(escapeRegExp(newInput))) {
          if (isInputGreaterThanDecimals(newInput, maxDecimals)) return;

          setInputValue(newInput);
          onChange?.(parseUnits(newInput, maxDecimals));
        }
      },
      [maxDecimals, onChange]
    );

    const valueFormattedWithLocale = React.useMemo(() => {
      const locale = navigator.language;
      const [searchValue, replaceValue] = localeUsesComma(locale)
        ? [/\./g, ","]
        : [/,/g, "."];
      return inputValue.replace(searchValue, replaceValue);
    }, [inputValue]);

    return (
      <Input
        {...props}
        ref={ref}
        value={valueFormattedWithLocale}
        onChange={(event) => {
          enforcer(event.target.value.replace(/,/g, "."));
        }}
        className={cn(className)}
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        minLength={1}
        maxLength={79}
        spellCheck="false"
        placeholder={placeholder}
      />
    );
  }
);
BigIntInput.displayName = "BigIntInput";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

function localeUsesComma(locale: string) {
  const decimalSeparator = new Intl.NumberFormat(locale).format(1.1)[1];
  return decimalSeparator === ",";
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function isInputGreaterThanDecimals(value: string, maxDecimals?: number) {
  const decimalGroups = value.split(".");
  return (
    !!maxDecimals &&
    decimalGroups.length > 1 &&
    decimalGroups[1].length > maxDecimals
  );
}
