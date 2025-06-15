import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import type { Tanker, Bmc, Driver, Tester } from '@/lib/types';
import type { TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Fetches all tankers from the 'tankers' table.
 * @returns {Promise<Tanker[]>} A promise that resolves to an array of tanker objects.
 */
const fetchTankers = async (): Promise<Tanker[]> => {
  const { data, error } = await supabase.from('tankers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Fetches all BMCs (Bulk Milk Coolers) from the 'bmcs' table.
 * @returns {Promise<Bmc[]>} A promise that resolves to an array of BMC objects.
 */
const fetchBmcs = async (): Promise<Bmc[]> => {
  const { data, error } = await supabase.from('bmcs').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Fetches all drivers from the 'drivers' table.
 * @returns {Promise<Driver[]>} A promise that resolves to an array of driver objects.
 */
const fetchDrivers = async (): Promise<Driver[]> => {
  const { data, error } = await supabase.from('drivers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Fetches all testers from the 'testers' table.
 * @returns {Promise<Tester[]>} A promise that resolves to an array of tester objects.
 */
const fetchTesters = async (): Promise<Tester[]> => {
  const { data, error } = await supabase.from('testers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * A form component for creating new tanker milk entries.
 * It includes fields for date, tanker, BMC, quantity, quality, fat, SNF, etc.
 * It also features logic to pre-fill driver and tester based on previous entries for the same tanker on the same day.
 */
const TankerEntryForm = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [tanker, setTanker] = React.useState('');
  const [bmc, setBmc] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [quality, setQuality] = React.useState('');
  const [fat, setFat] = React.useState('');
  const [snf, setSnf] = React.useState('');
  const [chamber, setChamber] = React.useState('');
  const [driver, setDriver] = React.useState('');
  const [tester, setTester] = React.useState('');
  const [isDriverTesterLocked, setIsDriverTesterLocked] = React.useState(false);

  const { data: tankers, isLoading: isLoadingTankers } = useQuery({ queryKey: ['tankers'], queryFn: fetchTankers });
  const { data: bmcs, isLoading: isLoadingBmcs } = useQuery({ queryKey: ['bmcs'], queryFn: fetchBmcs });
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });
  const { data: testers, isLoading: isLoadingTesters } = useQuery({ queryKey: ['testers'], queryFn: fetchTesters });

  /**
   * React Query mutation for adding a new milk entry to the database.
   * Handles success and error states, showing appropriate toasts.
   * On success, it invalidates the 'milk_entries' query to refresh the summary table
   * and resets some form fields for the next entry.
   */
  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: TablesInsert<'milk_entries'>) => {
      const { error } = await supabase.from('milk_entries').insert(newEntry);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milk_entries'] });
      toast.success("Tanker entry has been saved.");
      // Reset per-entry fields, but keep date, tanker, driver, and tester for the next entry.
      setBmc('');
      setQuantity('');
      setQuality('');
      setFat('');
      setSnf('');
      setChamber('');
    },
    onError: (error: Error) => {
      toast.error("Error saving entry", {
        description: error.message,
      });
    },
  });

  /**
   * useEffect hook to automatically fetch and set the driver and tester
   * based on the most recent entry for the selected tanker and date.
   * This locks the driver and tester fields if an entry already exists, ensuring consistency.
   */
  React.useEffect(() => {
    const findEntryAndSetDriverTester = async () => {
      if (!date || !tanker) {
        setDriver('');
        setTester('');
        setIsDriverTesterLocked(false);
        return;
      }

      const formattedDate = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('milk_entries')
        .select('driver, tester')
        .eq('tanker', tanker)
        .eq('date', formattedDate)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking for existing entry:", error.message);
        // Silently fail to avoid bothering user
        setDriver('');
        setTester('');
        setIsDriverTesterLocked(false);
        return;
      }

      if (data) {
        setDriver(data.driver);
        setTester(data.tester);
        setIsDriverTesterLocked(true);
      } else {
        setDriver('');
        setTester('');
        setIsDriverTesterLocked(false);
      }
    };

    findEntryAndSetDriverTester();
  }, [date, tanker]);

  /**
   * Handles the form submission event.
   * It performs validation, constructs the new entry object, and calls the mutation to save it.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Not authenticated", { description: "You must be logged in to save entries." });
      return;
    }

    if (!date || !tanker || !bmc || !quantity || !quality || !fat || !snf || !chamber || !driver || !tester) {
      toast.error("Missing fields", { description: "Please fill out all required fields before saving." });
      return;
    }

    const newEntry: TablesInsert<'milk_entries'> = {
      date: format(date, 'yyyy-MM-dd'),
      tanker,
      bmc,
      quantity: Number(quantity),
      quality,
      fat: Number(fat),
      snf: Number(snf),
      chamber: Number(chamber),
      driver,
      tester,
      user_id: user.id,
    };

    addEntryMutation.mutate(newEntry);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tanker-number">Tanker Number</Label>
        <Select value={tanker} onValueChange={setTanker} disabled={isLoadingTankers}>
          <SelectTrigger id="tanker-number">
            <SelectValue placeholder="Select tanker" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingTankers ? <SelectItem value="loading" disabled>Loading...</SelectItem> : tankers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bmc">BMC (Collection Center)</Label>
        <Select value={bmc} onValueChange={setBmc} disabled={isLoadingBmcs}>
          <SelectTrigger id="bmc">
            <SelectValue placeholder="Select BMC" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingBmcs ? <SelectItem value="loading" disabled>Loading...</SelectItem> : bmcs?.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity (Kg)</Label>
        <Input id="quantity" type="number" placeholder="e.g. 5000" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quality">Milk Quality</Label>
        <Select value={quality} onValueChange={setQuality}>
          <SelectTrigger id="quality">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Sour">Sour</SelectItem>
            <SelectItem value="Curd">Curd</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fat">Fat %</Label>
        <Input id="fat" type="number" step="0.01" placeholder="e.g. 3.5" value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="snf">SNF %</Label>
        <Input id="snf" type="number" step="0.01" placeholder="e.g. 8.5" value={snf} onChange={(e) => setSnf(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="chamber">Chamber</Label>
        <Select value={chamber} onValueChange={setChamber}>
          <SelectTrigger id="chamber">
            <SelectValue placeholder="Select chamber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
        <Label htmlFor="driver">Driver Name</Label>
        <Select value={driver} onValueChange={setDriver} disabled={isLoadingDrivers || !tanker || isDriverTesterLocked}>
          <SelectTrigger id="driver">
            <SelectValue placeholder={!tanker ? "Select tanker first" : "Select driver"} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingDrivers ? <SelectItem value="loading" disabled>Loading...</SelectItem> : drivers?.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tester">Tester Name</Label>
        <Select value={tester} onValueChange={setTester} disabled={isLoadingTesters || !tanker || isDriverTesterLocked}>
          <SelectTrigger id="tester">
            <SelectValue placeholder={!tanker ? "Select tanker first" : "Select tester"} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingTesters ? <SelectItem value="loading" disabled>Loading...</SelectItem> : testers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="lg:col-span-2 flex items-end">
        <Button type="submit" className="w-full md:w-auto" disabled={addEntryMutation.isPending}>
          {addEntryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Entry
        </Button>
      </div>
    </form>
  );
};

export default TankerEntryForm;
