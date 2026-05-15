import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockData";
import type { ExpensePayload, Transaction, TransactionType } from "@/types";
import { formatCurrency } from "@/utils/formatters";

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

type ExpenseActionsProps = {
  transaction: Transaction;
  onUpdate: (transactionId: string, payload: ExpensePayload) => Promise<unknown>;
  onDelete: (transactionId: string) => Promise<unknown>;
};

const getFormValues = (transaction: Transaction): ExpenseForm => ({
  amount: transaction.amount,
  description: transaction.description,
  date: transaction.date,
  dueDate: transaction.dueDate || "",
  category: transaction.category,
  type: transaction.type,
  status: transaction.status,
  personName: transaction.personName || "",
  personPhone: transaction.personPhone || "",
});

export default function ExpenseActions({ transaction, onUpdate, onDelete }: ExpenseActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: getFormValues(transaction),
  });

  const selectedType = watch("type");
  const selectedStatus = watch("status");
  const formId = `edit-expense-${transaction.id}`;

  useEffect(() => {
    if (editOpen) {
      reset(getFormValues(transaction));
      setFormError(null);
    }
  }, [editOpen, reset, transaction]);

  const submitEdit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onUpdate(transaction.id, {
        ...values,
        dueDate: values.status === "pending" ? values.dueDate : undefined,
        personName: values.status === "pending" ? values.personName?.trim() : undefined,
        personPhone: values.status === "pending" ? values.personPhone?.trim() : undefined,
      });
      setEditOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not update transaction.");
    }
  });

  const confirmDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
      setDeleteOpen(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete transaction.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)} aria-label={`Edit ${transaction.description}`}>
        <Pencil />
        Edit
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} aria-label={`Delete ${transaction.description}`}>
        <Trash2 />
        Delete
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WalletCards className="size-5 text-primary" />
              Edit transaction
            </DialogTitle>
            <DialogDescription>Update the amount, details, status, or pending person information.</DialogDescription>
          </DialogHeader>

          <form id={formId} className="grid gap-4" onSubmit={submitEdit}>
            {formError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p> : null}

            <div className="grid gap-2">
              <Label htmlFor={`${formId}-amount`}>Amount</Label>
              <Input id={`${formId}-amount`} type="number" step="0.01" {...register("amount")} />
              {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${formId}-description`}>Description</Label>
              <Input id={`${formId}-description`} placeholder="Groceries, school fee, salary..." {...register("description")} />
              {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${formId}-date`}>Date</Label>
                <Input id={`${formId}-date`} type="date" {...register("date")} />
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
                  <Label htmlFor={`${formId}-person-name`}>Person name</Label>
                  <Input id={`${formId}-person-name`} placeholder="Name" {...register("personName")} />
                  {errors.personName ? <p className="text-sm text-destructive">{errors.personName.message}</p> : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${formId}-person-phone`}>Phone number</Label>
                  <Input id={`${formId}-person-phone`} placeholder="+977 98..." {...register("personPhone")} />
                  {errors.personPhone ? <p className="text-sm text-destructive">{errors.personPhone.message}</p> : null}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`${formId}-due-date`}>Date to pay</Label>
                  <Input id={`${formId}-due-date`} type="date" {...register("dueDate")} />
                  {errors.dueDate ? <p className="text-sm text-destructive">{errors.dueDate.message}</p> : null}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transaction</DialogTitle>
            <DialogDescription>This will remove the selected transaction from the list.</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/35 p-4">
            <p className="font-medium">{transaction.description}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(transaction.amount)}</p>
          </div>
          {deleteError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{deleteError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete transaction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
