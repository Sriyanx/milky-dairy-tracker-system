
import TankerEntryForm from '@/components/TankerEntryForm';
import SummaryTable from '@/components/SummaryTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Dashboard = () => {
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
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
