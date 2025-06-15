
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type MasterDataItem = { id: string; name: string };

const fetchMasterData = (tableName: string) => async () => {
    const { data, error } = await supabase.from(tableName as any).select('*');
    if (error) {
      toast.error(`Error fetching ${tableName}: ${error.message}`);
      throw new Error(error.message);
    }
    return data || [];
};

const MasterDataTable = ({ data, onAdd, isLoading }: { data: MasterDataItem[], onAdd: () => void, isLoading: boolean }) => (
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
                <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </CardContent>
  </Card>
);

const MasterDataTabContent = ({ tableName, onAdd }: { tableName: string; onAdd: () => void }) => {
    const { data = [], isLoading } = useQuery<MasterDataItem[]>({ queryKey: [tableName], queryFn: fetchMasterData(tableName) });
    return <MasterDataTable data={data} onAdd={onAdd} isLoading={isLoading} />;
};


const MasterData = () => {
  const handleAdd = (type: string) => toast.info(`Adding a new ${type} is not yet implemented.`);

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
          <MasterDataTabContent tableName="tankers" onAdd={() => handleAdd('Tanker')} />
        </TabsContent>
        <TabsContent value="bmcs" className="mt-4">
          <MasterDataTabContent tableName="bmcs" onAdd={() => handleAdd('BMC')} />
        </TabsContent>
        <TabsContent value="drivers" className="mt-4">
          <MasterDataTabContent tableName="drivers" onAdd={() => handleAdd('Driver')} />
        </TabsContent>
        <TabsContent value="testers" className="mt-4">
          <MasterDataTabContent tableName="testers" onAdd={() => handleAdd('Tester')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterData;
