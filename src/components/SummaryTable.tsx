
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MilkEntry } from "@/lib/types";
import { format } from 'date-fns';
import { calculateKg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SummaryTable = ({ entries }: { entries: MilkEntry[] }) => {
    
    const handleEdit = (id: string) => {
        // Placeholder for edit functionality
        toast.info(`Edit action for entry ${id}. (Full functionality to be implemented)`);
    };

    const handleDelete = (id: string) => {
        // Placeholder for delete functionality. 
        // In a real app, this would likely involve a confirmation dialog and an API call.
        toast.warning(`Delete action for entry ${id}. (Full functionality to be implemented)`);
    };

    if (!entries || entries.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No entries found for the selected filters.</div>
    }
  
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
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry: MilkEntry) => (
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
            <TableCell className="flex justify-center items-center gap-0.5">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(entry.id)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SummaryTable;
