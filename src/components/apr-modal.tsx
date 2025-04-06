import { useGetDurationThresholds } from "@/services/constants-multiplier/get-duration-thresholds";
import { useAPRForDuration } from "@/lib/hooks/use-apr-for-duration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AprModal() {
  const { data: bscThresholds } = useGetDurationThresholds({ chainId: 56 });
  const { data: ethThresholds } = useGetDurationThresholds({ chainId: 1 });

  // Get APR values for different durations for both chains
  const bsc3MonthsAPR = useAPRForDuration({
    threshold: bscThresholds?.[0]?.threshold || 0n,
    chainId: 56,
  });
  const bsc1YearAPR = useAPRForDuration({
    threshold: bscThresholds?.[1]?.threshold || 0n,
    chainId: 56,
  });
  const bsc2YearsAPR = useAPRForDuration({
    threshold: bscThresholds?.[2]?.threshold || 0n,
    chainId: 56,
  });

  const eth3MonthsAPR = useAPRForDuration({
    threshold: ethThresholds?.[0]?.threshold || 0n,
    chainId: 1,
  });
  const eth1YearAPR = useAPRForDuration({
    threshold: ethThresholds?.[1]?.threshold || 0n,
    chainId: 1,
  });
  const eth2YearsAPR = useAPRForDuration({
    threshold: ethThresholds?.[2]?.threshold || 0n,
    chainId: 1,
  });

  const durationsList = [
    {
      duration: "3 Months",
      bscAPR: bsc3MonthsAPR.data,
      ethAPR: eth3MonthsAPR.data,
    },
    {
      duration: "1 Year",
      bscAPR: bsc1YearAPR.data,
      ethAPR: eth1YearAPR.data,
    },
    {
      duration: "2 Years",
      bscAPR: bsc2YearsAPR.data,
      ethAPR: eth2YearsAPR.data,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View APR Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>APR Details</DialogTitle>
          <DialogDescription className="sr-only">
            Current APR values for different staking durations on BSC and ETH
            chains.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duration</TableHead>
                <TableHead>BSC APR</TableHead>
                <TableHead>ETH APR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {durationsList.map((item) => (
                <TableRow key={item.duration}>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell>
                    {item.bscAPR ? `${item.bscAPR.toFixed(2)}%` : "Loading..."}
                  </TableCell>
                  <TableCell>
                    {item.ethAPR ? `${item.ethAPR.toFixed(2)}%` : "Loading..."}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
