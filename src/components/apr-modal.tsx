import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAPRForDuration } from "@/lib/hooks/use-apr-for-duration";
import { useGetDurationThresholds } from "@/services/constants-multiplier/get-duration-thresholds";

import { Button } from "./ui/button";

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function AprModal() {
  const { data: durations } = useGetDurationThresholds();

  // Get APR for each duration
  const { data: apr3m } = useAPRForDuration(durations?.[0]?.threshold || 0n);
  const { data: apr1y } = useAPRForDuration(durations?.[1]?.threshold || 0n);
  const { data: apr2y } = useAPRForDuration(durations?.[2]?.threshold || 0n);
  const { data: apr4y } = useAPRForDuration(durations?.[3]?.threshold || 0n);

  const durationsList = [
    { label: "3 Months", apr: apr3m },
    { label: "1 Year", apr: apr1y },
    { label: "2 Years", apr: apr2y },
    { label: "4 Years", apr: apr4y },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          See APR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>APR by Duration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {durationsList.map((duration) => (
            <div
              key={duration.label}
              className="grid grid-cols-2 items-center gap-4"
            >
              <span className="text-sm font-medium">{duration.label}</span>
              <span className="text-sm">
                {duration.apr
                  ? percentageFormatter.format(duration.apr)
                  : "Loading..."}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
