import React, { useState, useMemo, useRef } from 'react';
import TankerEntryForm from '@/components/TankerEntryForm';
import SummaryTable from '@/components/SummaryTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Calendar as CalendarIcon, RefreshCcw, Loader2, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { format, isSameDay } from 'date-fns';
import { calculateKg, cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MilkEntry, Tanker, Bmc, Driver, Tester } from '@/lib/types';

/**
 * Fetches all milk entries from the 'milk_entries' table in Supabase, ordered by date descending.
 * @returns {Promise<MilkEntry[]>} A promise that resolves to an array of milk entries.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
const fetchMilkEntries = async (): Promise<MilkEntry[]> => {
  const { data, error } = await supabase.from('milk_entries').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as MilkEntry[]) || [];
};

/**
 * Fetches all tankers from the 'tankers' table in Supabase.
 * @returns {Promise<Tanker[]>} A promise that resolves to an array of tankers.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
const fetchTankers = async (): Promise<Tanker[]> => {
  const { data, error } = await supabase.from('tankers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Fetches all BMCs (Bulk Milk Coolers) from the 'bmcs' table in Supabase.
 * @returns {Promise<Bmc[]>} A promise that resolves to an array of BMCs.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
const fetchBmcs = async (): Promise<Bmc[]> => {
  const { data, error } = await supabase.from('bmcs').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Fetches all drivers from the 'drivers' table in Supabase.
 * @returns {Promise<Driver[]>} A promise that resolves to an array of drivers.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
const fetchDrivers = async (): Promise<Driver[]> => {
  const { data, error } = await supabase.from('drivers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Fetches all testers from the 'testers' table in Supabase.
 * @returns {Promise<Tester[]>} A promise that resolves to an array of testers.
 * @throws {Error} Throws an error if the fetch operation fails.
 */
const fetchTesters = async (): Promise<Tester[]> => {
  const { data, error } = await supabase.from('testers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * The main dashboard component, displaying tanker entry form, filters, and summary table.
 */
const Dashboard = () => {
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterTanker, setFilterTanker] = useState<string>('');
  const [filterBmc, setFilterBmc] = useState<string>('');
  const [filterChamber, setFilterChamber] = useState<string>('');
  const [filterQuality, setFilterQuality] = useState<string>('');
  const [filterDriver, setFilterDriver] = useState<string>('');
  const [filterTester, setFilterTester] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: milkEntries, isLoading: isLoadingEntries } = useQuery({ queryKey: ['milk_entries'], queryFn: fetchMilkEntries });
  const { data: tankers, isLoading: isLoadingTankers } = useQuery({ queryKey: ['tankers'], queryFn: fetchTankers });
  const { data: bmcs, isLoading: isLoadingBmcs } = useQuery({ queryKey: ['bmcs'], queryFn: fetchBmcs });
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });
  const { data: testers, isLoading: isLoadingTesters } = useQuery({ queryKey: ['testers'], queryFn: fetchTesters });

  /**
   * Memoized computation of filtered milk entries based on the current filter state.
   */
  const filteredEntries = useMemo(() => {
    if (!milkEntries) return [];
    return milkEntries.filter(entry => {
      const dateMatch = filterDate ? isSameDay(new Date(entry.date), filterDate) : true;
      const tankerMatch = filterTanker ? entry.tanker === filterTanker : true;
      const bmcMatch = filterBmc ? entry.bmc === filterBmc : true;
      const chamberMatch = filterChamber ? entry.chamber === Number(filterChamber) : true;
      const qualityMatch = filterQuality ? entry.quality === filterQuality : true;
      const driverMatch = filterDriver ? entry.driver === filterDriver : true;
      const testerMatch = filterTester ? entry.tester === filterTester : true;
      return dateMatch && tankerMatch && bmcMatch && chamberMatch && qualityMatch && driverMatch && testerMatch;
    });
  }, [milkEntries, filterDate, filterTanker, filterBmc, filterChamber, filterQuality, filterDriver, filterTester]);

  /**
   * Handles exporting the filtered summary data to a CSV file.
   */
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

  /**
   * Triggers the hidden file input element to open the file selection dialog.
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles the file change event from the file input, processing the selected Excel file
   * for importing milk entries. It reads the file, validates columns and data,
   * and inserts the new entries into the database.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file change event.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (json.length === 0) {
          toast.warning("The selected Excel file is empty or has no data in the first sheet.");
          return;
        }

        const requiredColumns = ['Date', 'Tanker', 'Chamber', 'Driver', 'Tester', 'BMC', 'Qty (Kg)', 'Quality', 'Fat %', 'SNF %'];
        const firstRow = json[0];
        const missingColumns = requiredColumns.filter(col => !Object.prototype.hasOwnProperty.call(firstRow, col));

        if (missingColumns.length > 0) {
          toast.error(`Missing columns in Excel file: ${missingColumns.join(', ')}`);
          return;
        }
        
        const newEntries = json.map((row, index) => {
          const dateParts = String(row['Date']).split('/');
          if (dateParts.length !== 3) throw new Error(`Invalid date format in row ${index + 2}: ${row['Date']}. Expected dd/MM/yyyy.`);
          const [day, month, year] = dateParts;
          const isoDate = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];

          const chamber = Number(row['Chamber']);
          if (chamber !== 1 && chamber !== 2) {
            throw new Error(`Invalid chamber value in row ${index + 2}: ${row['Chamber']}. Must be 1 or 2.`);
          }

          const quality = String(row['Quality']) as MilkEntry['quality'];
          if (!['Good', 'Sour', 'Curd'].includes(quality)) {
            throw new Error(`Invalid quality value in row ${index + 2}: ${row['Quality']}. Must be 'Good', 'Sour', or 'Curd'.`);
          }

          const entry: Omit<MilkEntry, 'id' | 'created_at' | 'user_id'> = {
            date: isoDate,
            tanker: String(row['Tanker']),
            chamber: chamber,
            driver: String(row['Driver']),
            tester: String(row['Tester']),
            bmc: String(row['BMC']),
            quantity: Number(row['Qty (Kg)']),
            quality: quality,
            fat: Number(row['Fat %']),
            snf: Number(row['SNF %']),
          };
          
          if (isNaN(entry.chamber) || isNaN(entry.quantity) || isNaN(entry.fat) || isNaN(entry.snf)) {
            throw new Error(`Invalid number format in row ${index + 2}. Please check values.`);
          }
          if (new Date(isoDate).toString() === 'Invalid Date') {
              throw new Error(`Invalid date in row ${index + 2}: ${row['Date']}`);
          }

          return entry;
        });

        const { error } = await supabase.from('milk_entries').insert(newEntries);

        if (error) throw new Error(error.message);

        toast.success(`${newEntries.length} entries imported successfully!`);
        queryClient.invalidateQueries({ queryKey: ['milk_entries'] });

      } catch (error: any) {
        toast.error(`Import failed: ${error.message}`);
        console.error(error);
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /**
   * Resets all active filters to their default states and shows a confirmation toast.
   */
  const handleResetFilters = () => {
    setFilterDate(undefined);
    setFilterTanker('');
    setFilterBmc('');
    setFilterChamber('');
    setFilterQuality('');
    setFilterDriver('');
    setFilterTester('');
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
            <Button onClick={handleImportClick} size="sm" variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Import from Excel
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button onClick={handleExport} size="sm" variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
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
                      <span className="truncate">
                        {filterDate ? format(filterDate, "PPP") : "Pick a date"}
                      </span>
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
                <Label htmlFor="filter-driver">Driver</Label>
                <Select value={filterDriver} onValueChange={setFilterDriver}>
                  <SelectTrigger id="filter-driver" className="bg-background">
                    <SelectValue placeholder="All Drivers" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDrivers ? <SelectItem value="loading" disabled>Loading...</SelectItem> : drivers?.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-tester">Tester</Label>
                <Select value={filterTester} onValueChange={setFilterTester}>
                  <SelectTrigger id="filter-tester" className="bg-background">
                    <SelectValue placeholder="All Testers" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTesters ? <SelectItem value="loading" disabled>Loading...</SelectItem> : testers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-chamber">Chamber</Label>
                <Select value={filterChamber} onValueChange={setFilterChamber}>
                  <SelectTrigger id="filter-chamber" className="bg-background">
                    <SelectValue placeholder="All Chambers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-quality">Quality</Label>
                <Select value={filterQuality} onValueChange={setFilterQuality}>
                  <SelectTrigger id="filter-quality" className="bg-background">
                    <SelectValue placeholder="All Qualities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Sour">Sour</SelectItem>
                    <SelectItem value="Curd">Curd</SelectItem>
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
