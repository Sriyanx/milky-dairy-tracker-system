
import TankerEntryForm from '@/components/TankerEntryForm';
import SummaryTable from '@/components/SummaryTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { milkEntries } from '@/lib/data';
import { calculateKg } from '@/lib/utils';

const Dashboard = () => {
  const handleExport = () => {
    const dataToExport = milkEntries.map(entry => ({
      'Date': format(entry.date, 'dd/MM/yyyy'),
      'Tanker': entry.tanker,
      'BMC': entry.bmc,
      'Qty (Kg)': entry.quantity,
      'Quality': entry.quality,
      'Fat %': entry.fat.toFixed(2),
      'SNF %': entry.snf.toFixed(2),
      'Fat (Kg)': calculateKg(entry.quantity, entry.fat),
      'SNF (Kg)': calculateKg(entry.quantity, entry.snf),
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `daily_summary_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Daily summary exported successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Tanker Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <TankerEntryForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Summary</CardTitle>
          <Button onClick={handleExport} size="sm" variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </CardHeader>
        <CardContent>
          <SummaryTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
