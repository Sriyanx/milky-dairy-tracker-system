
import React, { useState, useMemo } from 'react';
import TankerEntryForm from '@/components/TankerEntryForm';
import SummaryTable from '@/components/SummaryTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Calendar as CalendarIcon, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { format, isSameDay } from 'date-fns';
import { calculateKg, cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MilkEntry, Tanker, Bmc } from '@/lib/types';

const fetchMilkEntries = async (): Promise<MilkEntry[]> => {
  const { data, error } = await supabase.from('milk_entries').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchTankers = async (): Promise<Tanker[]> => {
  const { data, error } = await supabase.from('tankers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchBmcs = async (): Promise<Bmc[]> => {
  const { data, error } = await supabase.from('bmcs').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const Dashboard = () => {
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterTanker, setFilterTanker] = useState<string>('');
  const [filterBmc, setFilterBmc] = useState<string>('');

  const { data: milkEntries, isLoading: isLoadingEntries } = useQuery({ queryKey: ['milk_entries'], queryFn: fetchMilkEntries });
  const { data: tankers, isLoading: isLoadingTankers } = useQuery({ queryKey: ['tankers'], queryFn: fetchTankers });
  const { data: bmcs, isLoading: isLoadingBmcs } = useQuery({ queryKey: ['bmcs'], queryFn: fetchBmcs });

  const filteredEntries = useMemo(() => {
    if (!milkEntries) return [];
    return milkEntries.filter(entry => {
      const dateMatch = filterDate ? isSameDay(new Date(entry.date), filterDate) : true;
      const tankerMatch = filterTanker ? entry.tanker === filterTanker : true;
      const bmcMatch = filterBmc ? entry.bmc === filterBmc : true;
      return dateMatch && tankerMatch && bmcMatch;
    });
  }, [milkEntries, filterDate, filterTanker, filterBmc]);

  const handleExport = () => {
    const dataToExport = filteredEntries.map(entry => ({
      'Date': format(new Date(entry.date), 'dd/MM/yyyy'),
      'Tanker': entry.tanker,
      'BMC': entry.bmc,
      'Qty (Kg)': entry.quantity,
      'Quality': entry.quality,
      'Fat %': entry.fat.toFixed(2),
      'SNF %': entry.snf.toFixed(2),
      'Fat (Kg)': calculateKg(entry.quantity, entry.fat),
      'SNF (Kg)': calculateKg(entry.quantity, entry.snf),
    }));

    if (dataToExport.length === 0) {
        toast.warning("No data to export for the current selection.");
        return;
    }

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
    toast.success('Filtered summary exported successfully!');
  };
  
  const handleResetFilters = () => {
    setFilterDate(undefined);
    setFilterTanker('');
    setFilterBmc('');
    toast.info('Filters have been reset.');
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
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} size="sm" variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="filter-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="filter-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !filterDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterDate}
                      onSelect={setFilterDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-tanker">Tanker</Label>
                <Select value={filterTanker} onValueChange={setFilterTanker}>
                  <SelectTrigger id="filter-tanker" className="bg-background">
                    <SelectValue placeholder="All Tankers" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTankers ? <SelectItem value="loading" disabled>Loading...</SelectItem> : tankers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-bmc">BMC</Label>
                <Select value={filterBmc} onValueChange={setFilterBmc}>
                  <SelectTrigger id="filter-bmc" className="bg-background">
                    <SelectValue placeholder="All BMCs" />
                  </SelectTrigger>
                  <SelectContent>
                     {isLoadingBmcs ? <SelectItem value="loading" disabled>Loading...</SelectItem> : bmcs?.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                  <Button onClick={handleResetFilters} variant="outline" className="w-full">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset
                  </Button>
              </div>
            </div>
          </div>
          {isLoadingEntries ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SummaryTable entries={filteredEntries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
