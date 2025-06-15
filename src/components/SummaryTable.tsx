
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { milkEntries } from '@/lib/data';
import type { MilkEntry } from "@/lib/types";
import { format } from 'date-fns';
import { calculateKg } from "@/lib/utils";

const SummaryTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Tanker</TableHead>
          <TableHead>BMC</TableHead>
          <TableHead className="text-right">Qty (Kg)</TableHead>
          <TableHead>Quality</TableHead>
          <TableHead className="text-right">Fat %</TableHead>
          <TableHead className="text-right">SNF %</TableHead>
          <TableHead className="text-right">Fat (Kg)</TableHead>
          <TableHead className="text-right">SNF (Kg)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {milkEntries.map((entry: MilkEntry) => (
          <TableRow key={entry.id}>
            <TableCell>{format(entry.date, 'dd/MM/yyyy')}</TableCell>
            <TableCell>{entry.tanker}</TableCell>
            <TableCell>{entry.bmc}</TableCell>
            <TableCell className="text-right">{entry.quantity.toLocaleString()}</TableCell>
            <TableCell>{entry.quality}</TableCell>
            <TableCell className="text-right">{entry.fat.toFixed(2)}</TableCell>
            <TableCell className="text-right">{entry.snf.toFixed(2)}</TableCell>
            <TableCell className="text-right font-medium">{calculateKg(entry.quantity, entry.fat)}</TableCell>
            <TableCell className="text-right font-medium">{calculateKg(entry.quantity, entry.snf)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SummaryTable;
