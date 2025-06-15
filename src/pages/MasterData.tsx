
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from "react";
import AddMasterDataItemDialog from "@/components/AddMasterDataItemDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

type MasterDataItem = { id: string; name: string };
export type MasterDataTableName = 'tankers' | 'bmcs' | 'drivers' | 'testers';

const fetchMasterData = (tableName: MasterDataTableName) => async (): Promise<MasterDataItem[]> => {
    const { data, error } = await supabase.from(tableName).select('id, name');
    if (error) {
      toast.error(`Error fetching ${tableName}: ${error.message}`);
      throw new Error(error.message);
    }
    return data || [];
};

const MasterDataTable = ({ data, onAdd, onEdit, onDelete, isLoading }: { data: MasterDataItem[], onAdd: () => void, onEdit: (item: MasterDataItem) => void, onDelete: (item: MasterDataItem) => void, isLoading: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg">Entries</CardTitle>
      <Button size="sm" onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(item)}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </CardContent>
  </Card>
);

const MasterDataTabContent = ({ tableName, onAdd, onEdit, onDelete }: { tableName: MasterDataTableName; onAdd: () => void, onEdit: (item: MasterDataItem) => void, onDelete: (item: MasterDataItem) => void }) => {
    const { data = [], isLoading } = useQuery<MasterDataItem[]>({ queryKey: [tableName], queryFn: fetchMasterData(tableName) });
    return <MasterDataTable data={data} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} isLoading={isLoading} />;
};


const MasterData = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MasterDataItem | null>(null);

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MasterDataItem | null>(null);

  const [currentTable, setCurrentTable] = useState<MasterDataTableName | null>(null);

  const handleAdd = (tableName: MasterDataTableName) => {
    setCurrentTable(tableName);
    setItemToEdit(null);
    setDialogOpen(true);
  };

  const handleEdit = (tableName: MasterDataTableName, item: MasterDataItem) => {
    setCurrentTable(tableName);
    setItemToEdit(item);
    setDialogOpen(true);
  };
  
  const handleDelete = (tableName: MasterDataTableName, item: MasterDataItem) => {
    setCurrentTable(tableName);
    setItemToDelete(item);
    setDeleteAlertOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!itemToDelete || !currentTable) throw new Error("Item or table not specified for deletion.");
      const { error } = await supabase.from(currentTable).delete().eq('id', itemToDelete.id);
      if (error) throw error;
      return { tableName: currentTable };
    },
    onSuccess: ({ tableName }) => {
        queryClient.invalidateQueries({ queryKey: [tableName] });
        toast.success('Item deleted successfully.');
        setDeleteAlertOpen(false);
        setItemToDelete(null);
    },
    onError: (error: Error) => {
        toast.error('Failed to delete item.', {
            description: error.message,
        });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Master Data Management</h1>
      <Tabs defaultValue="tankers" className="w-full">
        <TabsList>
          <TabsTrigger value="tankers">Tankers</TabsTrigger>
          <TabsTrigger value="bmcs">BMCs</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="testers">Testers</TabsTrigger>
        </TabsList>
        <TabsContent value="tankers" className="mt-4">
          <MasterDataTabContent tableName="tankers" onAdd={() => handleAdd('tankers')} onEdit={(item) => handleEdit('tankers', item)} onDelete={(item) => handleDelete('tankers', item)} />
        </TabsContent>
        <TabsContent value="bmcs" className="mt-4">
          <MasterDataTabContent tableName="bmcs" onAdd={() => handleAdd('bmcs')} onEdit={(item) => handleEdit('bmcs', item)} onDelete={(item) => handleDelete('bmcs', item)} />
        </TabsContent>
        <TabsContent value="drivers" className="mt-4">
          <MasterDataTabContent tableName="drivers" onAdd={() => handleAdd('drivers')} onEdit={(item) => handleEdit('drivers', item)} onDelete={(item) => handleDelete('drivers', item)} />
        </TabsContent>
        <TabsContent value="testers" className="mt-4">
          <MasterDataTabContent tableName="testers" onAdd={() => handleAdd('testers')} onEdit={(item) => handleEdit('testers', item)} onDelete={(item) => handleDelete('testers', item)} />
        </TabsContent>
      </Tabs>
      <AddMasterDataItemDialog
        isOpen={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            setItemToEdit(null);
          }
        }}
        tableName={currentTable}
        itemToEdit={itemToEdit}
      />
      <DeleteConfirmationDialog
        isOpen={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={() => deleteMutation.mutate()}
        itemName={itemToDelete?.name || ''}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default MasterData;
