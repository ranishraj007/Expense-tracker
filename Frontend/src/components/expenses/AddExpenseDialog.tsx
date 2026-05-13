import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, WalletCards } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockData";
import type { ExpensePayload, TransactionType } from "@/types";

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  description: z.string().min(2, "Description is required."),
  date: z.string().min(1, "Date is required."),
  category: z.string().min(1, "Choose a category."),
  type: z.enum(["credit", "debit"]),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

export default function AddExpenseDialog({ onAdd }: { onAdd: (payload: ExpensePayload) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      category: "Groceries",
      type: "debit",
    },
  });

  const selectedType = watch("type");

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onAdd(values);
      reset();
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add expense.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WalletCards className="size-5 text-primary" />
            Add family transaction
          </DialogTitle>
          <DialogDescription>Credit adds money to the household balance. Debit records spending.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={onSubmit}>
          {formError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
            {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Groceries, school fee, salary..." {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date ? <p className="text-sm text-destructive">{errors.date.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={watch("category")} onValueChange={(value) => setValue("category", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["debit", "credit"] as TransactionType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setValue("type", type, { shouldValidate: true })}
                >
                  {type === "credit" ? "Credit" : "Debit"}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
