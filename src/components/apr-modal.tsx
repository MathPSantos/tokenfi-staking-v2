import { useGetDurationThresholds } from "@/services/constants-multiplier/get-duration-thresholds";
import { useAPRForDuration } from "@/lib/hooks/use-apr-for-duration";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercentage } from "@/lib/utils";
import { HandCoinsIcon } from "lucide-react";

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
  const bsc4YearsAPR = useAPRForDuration({
    threshold: bscThresholds?.[3]?.threshold || 0n,
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
  const eth4YearsAPR = useAPRForDuration({
    threshold: ethThresholds?.[3]?.threshold || 0n,
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
    {
      duration: "4 Years",
      bscAPR: bsc4YearsAPR.data,
      ethAPR: eth4YearsAPR.data,
    },
  ];

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="sm">
          <HandCoinsIcon />
          APR
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="p-1.5 max-w-[425px]">
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
                  {item.bscAPR
                    ? `${formatPercentage.format(item.bscAPR)}`
                    : "Loading..."}
                </TableCell>
                <TableCell>
                  {item.ethAPR
                    ? `${formatPercentage.format(item.ethAPR)}`
                    : "Loading..."}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </HoverCardContent>
    </HoverCard>
  );
}
