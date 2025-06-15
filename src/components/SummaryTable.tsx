
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MilkEntry } from "@/lib/types";
import { format } from 'date-fns';
import { calculateKg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

/**
 * A table component to display a summary of milk entries.
 * It shows key details for each entry and provides actions for editing and deleting.
 * @param {{ entries: MilkEntry[] }} props - The component props, containing the list of entries to display.
 */
const SummaryTable = ({ entries }: { entries: MilkEntry[] }) => {
    const queryClient = useQueryClient();
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<MilkEntry | null>(null);

    /**
     * Placeholder handler for the edit action on a table row.
     * @param {string} id - The ID of the entry to be edited.
     */
    const handleEdit = (id: string) => {
        // Placeholder for edit functionality
        toast.info(`Edit action for entry ${id}. (Full functionality to be implemented)`);
    };

    /**
     * Triggers the delete confirmation dialog for a milk entry.
     * @param {MilkEntry} entry - The entry to be deleted.
     */
    const handleDelete = (entry: MilkEntry) => {
        setEntryToDelete(entry);
        setDeleteAlertOpen(true);
    };

    const deleteMutation = useMutation({
        mutationFn: async (entryId: string) => {
          if (!entryId) throw new Error("Entry ID not provided for deletion.");
          const { error } = await supabase.from('milk_entries').delete().eq('id', entryId);
          if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['milk_entries'] });
            toast.success('Entry deleted successfully.');
            setDeleteAlertOpen(false);
            setEntryToDelete(null);
        },
        onError: (error: Error) => {
            toast.error('Failed to delete entry.', {
                description: error.message,
            });
        },
    });

    if (!entries || entries.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No entries found for the selected filters.</div>
    }
  
  return (
    <>
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
                <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
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
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(entry)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        {entryToDelete && (
            <DeleteConfirmationDialog
                isOpen={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
                onConfirm={() => deleteMutation.mutate(entryToDelete.id)}
                itemName={`entry on ${format(new Date(entryToDelete.date), 'dd/MM/yyyy')}`}
                isDeleting={deleteMutation.isPending}
            />
        )}
    </>
  );
};

export default SummaryTable;
