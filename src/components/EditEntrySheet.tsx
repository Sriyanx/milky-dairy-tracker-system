
import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { MilkEntry, Tanker, Bmc, Driver, Tester } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

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

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  tanker: z.string().min(1, "Tanker is required."),
  chamber: z.coerce.number().min(1).max(2),
  driver: z.string().min(1, "Driver is required."),
  tester: z.string().min(1, "Tester is required."),
  bmc: z.string().min(1, "BMC is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  quality: z.enum(["Good", "Sour", "Curd"]),
  fat: z.coerce.number().min(0, "Fat cannot be negative."),
  snf: z.coerce.number().min(0, "SNF cannot be negative."),
});

type EditEntryFormValues = z.infer<typeof formSchema>;

type EditEntrySheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  entry: MilkEntry;
};

const EditEntrySheet = ({ isOpen, onOpenChange, entry }: EditEntrySheetProps) => {
  const queryClient = useQueryClient();

  const { data: tankers, isLoading: isLoadingTankers } = useQuery({ queryKey: ['tankers'], queryFn: fetchTankers });
  const { data: bmcs, isLoading: isLoadingBmcs } = useQuery({ queryKey: ['bmcs'], queryFn: fetchBmcs });
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });
  const { data: testers, isLoading: isLoadingTesters } = useQuery({ queryKey: ['testers'], queryFn: fetchTesters });

  const form = useForm<EditEntryFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (entry) {
      form.reset({
        ...entry,
        date: new Date(entry.date),
      });
    }
  }, [entry, form, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async (values: EditEntryFormValues) => {
      const { error } = await supabase
        .from('milk_entries')
        .update({
          ...values,
          date: format(values.date, 'yyyy-MM-dd'),
        })
        .eq('id', entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milk_entries'] });
      toast.success('Entry updated successfully.');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to update entry.', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: EditEntryFormValues) => {
    updateMutation.mutate(values);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Milk Entry</SheetTitle>
          <SheetDescription>
            Update details for the entry on {format(new Date(entry.date), 'PPP')}. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tanker" render={({ field }) => (
                <FormItem><FormLabel>Tanker</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger>{isLoadingTankers ? 'Loading...' : <SelectValue placeholder="Select a tanker" />}</SelectTrigger></FormControl><SelectContent>{tankers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="chamber" render={({ field }) => (
                <FormItem><FormLabel>Chamber</FormLabel><Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select chamber" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="driver" render={({ field }) => (
                <FormItem><FormLabel>Driver</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger>{isLoadingDrivers ? 'Loading...' : <SelectValue placeholder="Select a driver" />}</SelectTrigger></FormControl><SelectContent>{drivers?.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tester" render={({ field }) => (
                <FormItem><FormLabel>Tester</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger>{isLoadingTesters ? 'Loading...' : <SelectValue placeholder="Select a tester" />}</SelectTrigger></FormControl><SelectContent>{testers?.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="bmc" render={({ field }) => (
                <FormItem><FormLabel>BMC</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger>{isLoadingBmcs ? 'Loading...' : <SelectValue placeholder="Select a BMC" />}</SelectTrigger></FormControl><SelectContent>{bmcs?.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Qty (Kg)</FormLabel><FormControl><Input type="number" placeholder="Enter quantity" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="quality" render={({ field }) => (
                <FormItem><FormLabel>Quality</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select quality" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Good">Good</SelectItem><SelectItem value="Sour">Sour</SelectItem><SelectItem value="Curd">Curd</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fat" render={({ field }) => (
                <FormItem><FormLabel>Fat %</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Enter fat percentage" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="snf" render={({ field }) => (
                <FormItem><FormLabel>SNF %</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Enter SNF percentage" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <SheetFooter className="mt-6">
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditEntrySheet;
