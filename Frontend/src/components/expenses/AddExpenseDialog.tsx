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
  dueDate: z.string().optional(),
  category: z.string().min(1, "Choose a category."),
  type: z.enum(["credit", "debit"]),
  status: z.enum(["completed", "pending"]),
  personName: z.string().optional(),
  personPhone: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.status !== "pending") return;

  if (!values.personName?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["personName"], message: "Person name is required." });
  }
  if (!values.personPhone?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["personPhone"], message: "Phone number is required." });
  }
  if (!values.dueDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dueDate"], message: "Date to pay is required." });
  }
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
      dueDate: "",
      category: "Groceries",
      type: "debit",
      status: "completed",
      personName: "",
      personPhone: "",
    },
  });

  const selectedType = watch("type");
  const selectedStatus = watch("status");

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onAdd({
        ...values,
        dueDate: values.status === "pending" ? values.dueDate : undefined,
        personName: values.status === "pending" ? values.personName?.trim() : undefined,
        personPhone: values.status === "pending" ? values.personPhone?.trim() : undefined,
      });
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
          <DialogDescription>Credit can record money to take later. Debit can record money to pay later.</DialogDescription>
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

          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["completed", "pending"] as const).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={selectedStatus === status ? "default" : "outline"}
                  onClick={() => setValue("status", status, { shouldValidate: true })}
                >
                  {status === "pending" ? "Pending" : "Completed"}
                </Button>
              ))}
            </div>
          </div>

          {selectedStatus === "pending" ? (
            <div className="grid gap-4 rounded-lg border bg-muted/35 p-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="personName">Person name</Label>
                <Input id="personName" placeholder="Name" {...register("personName")} />
                {errors.personName ? <p className="text-sm text-destructive">{errors.personName.message}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="personPhone">Phone number</Label>
                <Input id="personPhone" placeholder="+977 98..." {...register("personPhone")} />
                {errors.personPhone ? <p className="text-sm text-destructive">{errors.personPhone.message}</p> : null}
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="dueDate">Date to pay</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
                {errors.dueDate ? <p className="text-sm text-destructive">{errors.dueDate.message}</p> : null}
              </div>
            </div>
          ) : null}

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
