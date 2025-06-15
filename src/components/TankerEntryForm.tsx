import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import type { Tanker, Bmc, Driver, Tester } from '@/lib/types';

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

const fetchDrivers = async (): Promise<Driver[]> => {
  const { data, error } = await supabase.from('drivers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchTesters = async (): Promise<Tester[]> => {
  const { data, error } = await supabase.from('testers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const TankerEntryForm = () => {
  const { toast } = useToast();
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

  const { data: tankers, isLoading: isLoadingTankers } = useQuery({ queryKey: ['tankers'], queryFn: fetchTankers });
  const { data: bmcs, isLoading: isLoadingBmcs } = useQuery({ queryKey: ['bmcs'], queryFn: fetchBmcs });
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });
  const { data: testers, isLoading: isLoadingTesters } = useQuery({ queryKey: ['testers'], queryFn: fetchTesters });

  React.useEffect(() => {
    // When tanker changes, reset driver and tester.
    setDriver('');
    setTester('');
  }, [tanker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success!",
      description: "Tanker entry has been saved.",
    });

    // Reset per-entry fields, but keep date, tanker, driver, and tester for the next entry.
    setBmc('');
    setQuantity('');
    setQuality('');
    setFat('');
    setSnf('');
    setChamber('');
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
        <Select value={driver} onValueChange={setDriver} disabled={isLoadingDrivers || !tanker}>
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
        <Select value={tester} onValueChange={setTester} disabled={isLoadingTesters || !tanker}>
          <SelectTrigger id="tester">
            <SelectValue placeholder={!tanker ? "Select tanker first" : "Select tester"} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingTesters ? <SelectItem value="loading" disabled>Loading...</SelectItem> : testers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="lg:col-span-2 flex items-end">
        <Button type="submit" className="w-full md:w-auto">Save Entry</Button>
      </div>
    </form>
  );
};

export default TankerEntryForm;
