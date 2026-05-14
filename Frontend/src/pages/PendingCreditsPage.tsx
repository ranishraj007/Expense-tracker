import { CalendarClock, Phone, UserRound } from "lucide-react";
import { useMemo } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function PendingCreditsPage() {
  const { user } = useAuth();
  const { transactions, isLoading, error, addExpense } = useExpenses(user?.id);
  const pendingTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.status === "pending"),
    [transactions],
  );

  const pendingCredit = pendingTransactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const pendingDebit = pendingTransactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending credits and debits</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track people you need to pay later or take payment from later.</p>
        </div>
        <AddExpenseDialog onAdd={addExpense} />
      </section>

      <ErrorMessage message={error} />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">Need to take later</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{formatCurrency(pendingCredit)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">Need to pay later</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">{formatCurrency(pendingDebit)}</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">Pending people</p>
          <p className="mt-1 text-2xl font-semibold">{pendingTransactions.length}</p>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Credit date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date to pay</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {isLoading ? "Loading pending entries..." : "No pending credits or debits found."}
                </TableCell>
              </TableRow>
            ) : (
              pendingTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="min-w-40 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="size-4 text-primary" />
                      {transaction.personName}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      {transaction.personPhone}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                  <TableCell className="min-w-56">{transaction.description}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="size-4 text-amber-700" />
                      {transaction.dueDate ? formatDate(transaction.dueDate) : "Not set"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type}>{transaction.type === "credit" ? "Take later" : "Pay later"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
