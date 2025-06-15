
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { MasterDataTableName } from "@/pages/MasterData";

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
});

type MasterDataItem = { id: string; name: string };

type AddMasterDataItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tableName: MasterDataTableName | null;
  itemToEdit?: MasterDataItem | null;
};

const AddMasterDataItemDialog = ({
  isOpen,
  onOpenChange,
  tableName,
  itemToEdit,
}: AddMasterDataItemDialogProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const isEditMode = !!itemToEdit;

  React.useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        form.reset({ name: itemToEdit.name });
      } else {
        form.reset({ name: "" });
      }
    }
  }, [isOpen, isEditMode, itemToEdit, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!tableName) throw new Error("Table name is not defined.");
      
      if (isEditMode) {
        if (!itemToEdit) throw new Error("Item to edit is not defined.");
        const { error } = await supabase.from(tableName).update({ name: values.name }).eq('id', itemToEdit.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from(tableName).insert({ name: values.name });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      if (tableName) {
        queryClient.invalidateQueries({ queryKey: [tableName] });
        const singleName = tableName.slice(0, -1);
        const action = isEditMode ? 'updated' : 'added';
        toast.success(`${titleCase(singleName)} ${action} successfully.`);
        onOpenChange(false);
      }
    },
    onError: (error: Error) => {
      const action = isEditMode ? 'update' : 'add new';
      toast.error(`Failed to ${action} item.`, {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const titleCase = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  if (!tableName) return null;

  const singleTableName = titleCase(tableName.slice(0, -1));

  const dialogTitle = isEditMode ? `Edit ${singleTableName}` : `Add New ${singleTableName}`;
  const dialogDescription = isEditMode 
    ? "Update the name for this item. Click save when you're done."
    : `Enter the name for the new ${singleTableName.toLowerCase()}. Click save when you're done.`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMasterDataItemDialog;
