
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tankers, bmcs, drivers, testers } from "@/lib/data";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";

type MasterDataItem = { id: string; name: string };
const MasterDataTable = ({ data, onAdd }: { data: MasterDataItem[], onAdd: () => void }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg">Entries</CardTitle>
      <Button size="sm" onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
    </CardHeader>
    <CardContent>
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
    </CardContent>
  </Card>
);

const MasterData = () => {
  const handleAdd = (type: string) => alert(`Add new ${type}`);

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
          <MasterDataTable data={tankers} onAdd={() => handleAdd('Tanker')} />
        </TabsContent>
        <TabsContent value="bmcs" className="mt-4">
          <MasterDataTable data={bmcs} onAdd={() => handleAdd('BMC')} />
        </TabsContent>
        <TabsContent value="drivers" className="mt-4">
          <MasterDataTable data={drivers} onAdd={() => handleAdd('Driver')} />
        </TabsContent>
        <TabsContent value="testers" className="mt-4">
          <MasterDataTable data={testers} onAdd={() => handleAdd('Tester')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterData;
